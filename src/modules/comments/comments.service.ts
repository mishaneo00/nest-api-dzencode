import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';
import { UserEntity } from './entity/user.entity';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DataSource } from 'typeorm';
import * as fs from 'fs/promises';
import { FileEntity } from '../files/entity/file.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FilesService } from '../files/files.service';
import { CommentEvents } from './comments.events';
import { CommentMapper } from './mappers/comment.mapper';
import {
  CommentCreatedPayload,
  CommentWithReplies,
} from './interfaces/comments.interfaces';
import { CommentResponseDto } from './dto/response-comment.dto';
import { FileType } from '../files/files.types';
import path from 'path';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    private eventEmitter: EventEmitter2,
    private readonly filesService: FilesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateCommentDto,
    userFingerprint: string,
    file?: Express.Multer.File,
  ): Promise<CommentResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    let savedFile: FileEntity | undefined = undefined;
    let savedFileType: FileType | undefined = undefined;

    try {
      if (file) {
        const fileProcessRelust = await this.filesService.processAndSave(file);
        savedFileType = fileProcessRelust.type;

        savedFile = await this.filesService.saveFileEntity(
          file,
          fileProcessRelust.isLoaded,
          manager,
        );
      }

      const user = await this.getOrCreateUser(dto, manager);

      const savedComment = await this.saveCommentEntity(
        dto,
        user,
        userFingerprint,
        savedFile,
        manager,
      );

      await queryRunner.commitTransaction();

      const responseDto = CommentMapper.toDto(savedComment);

      const { fingerprint, ...rest } = responseDto;

      const responseForAuthor = { ...rest, itsMy: true };

      const payload: CommentCreatedPayload = {
        comment: responseDto,
        file:
          savedFile && savedFile.isLoaded === false
            ? {
                fileId: savedFile.id,
                filename: savedFile.filename,
                type: savedFileType!,
              }
            : undefined,
      };

      this.eventEmitter.emit(CommentEvents.CREATED, payload);

      return responseForAuthor;
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (savedFile) {
        await this.filesService.removeLocalFile(savedFile);
      }

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    limit: number,
    cursorId?: number,
    direction: 'next' | 'prev' = 'next',
  ) {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .select('comment.id')
      .where('comment.parentId IS NULL')
      .withDeleted();
    if (cursorId) {
      if (direction === 'next') {
        queryBuilder
          .andWhere('comment.id < :cursorId', { cursorId })
          .orderBy('comment.id', 'DESC');
      } else {
        queryBuilder
          .andWhere('comment.id > :cursorId', { cursorId })
          .orderBy('comment.id', 'ASC');
      }
    } else {
      queryBuilder.orderBy('comment.id', 'DESC');
    }

    const rootCommentsId = await queryBuilder.take(limit).getMany();

    if (rootCommentsId.length === 0) return [];

    const rootIds = rootCommentsId.map((c) => c.id);

    const allComments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoinAndSelect('comment.file', 'file')
      .withDeleted()
      .where(
        new Brackets((qb) => {
          qb.where('comment.id IN (:...ids)', { ids: rootIds }).orWhere(
            'comment.rootId IN (:...ids)',
            { ids: rootIds },
          );
        }),
      )
      .orderBy('COALESCE(comment.rootId, comment.id)', 'DESC')
      .addOrderBy('comment.createdAt', 'ASC')
      .getMany();

    return this.buildTree(allComments);
  }

  async remove(id: number, fingerprint: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const manager = queryRunner.manager;

    let comment: CommentEntity | null = null;
    let responseDto;

    try {
      comment = await manager.findOne(CommentEntity, {
        where: { id },
        relations: ['file'],
      });
      if (!comment) {
        throw new NotFoundException('Комментарий не найден');
      }
      if (comment.fingerprint !== fingerprint) {
        throw new ForbiddenException('Нельзя удалить чужой комментарий');
      }

      if (comment.file) {
        await this.filesService.removeEntity(comment.file, manager);
      }

      if (!comment.parentId) {
        await manager.delete(CommentEntity, comment.id);

        responseDto = {
          id: comment.id,
          isDestroyed: true,
        };
      } else {
        const deletedComment = await manager.softRemove(CommentEntity, comment);
        responseDto = CommentMapper.toDto(deletedComment);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }

    this.eventEmitter.emit(CommentEvents.DELETED, responseDto);

    if (comment.file) {
      await this.filesService.removeLocalFile(comment.file);
    }
  }

  private async getOrCreateUser(
    dto: CreateCommentDto,
    manager: EntityManager,
  ): Promise<UserEntity> {
    let user = await manager.findOne(UserEntity, {
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (user) {
      if (user.email === dto.email && user.username !== dto.username) {
        throw new BadRequestException('Этот email уже занят другим именем');
      }
      if (user.username === dto.username && user.email !== dto.email) {
        throw new BadRequestException('Это имя пользователя уже занято');
      }
    } else {
      user = manager.create(UserEntity, {
        email: dto.email,
        username: dto.username,
        homepage: dto.homepage,
      });
      user = await manager.save(user);
    }

    return user;
  }

  private async saveCommentEntity(
    dto: CreateCommentDto,
    user: UserEntity,
    fingerprint: string,
    savedFile: FileEntity | undefined,
    manager: EntityManager,
  ): Promise<CommentEntity> {
    const newComment = manager.create(CommentEntity, {
      text: dto.text,
      author: user,
      parentId: dto.parentId,
      file: savedFile,
      fingerprint: fingerprint,
    });

    if (dto.parentId) {
      const parent = await manager.findOneBy(CommentEntity, {
        id: dto.parentId,
      });
      if (!parent) {
        throw new NotFoundException('Родительский комментарий не найден');
      }
      newComment.rootId = parent.rootId || parent.id;
    }

    return await manager.save(newComment);
  }

  private buildTree(comments: CommentEntity[]): CommentResponseDto[] {
    const map = new Map<number, CommentWithReplies>();
    const roots: CommentWithReplies[] = [];

    comments.forEach((comment) => {
      map.set(comment.id, { ...comment, replies: [] });
    });

    map.forEach((comment) => {
      if (comment.parentId) {
        const parent = map.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        roots.push(comment);
      }
    });

    const sortRoots = roots.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return sortRoots.map((c) => CommentMapper.toDto(c));
  }
}

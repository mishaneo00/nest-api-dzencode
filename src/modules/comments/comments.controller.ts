import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommentResponseDto } from './dto/response-comment.dto';
import { multerOptions } from './multer.options';
import { MulterExceptionFilter } from 'src/common/filters/multer-exception.filter';
import { FileSignaturePipe } from 'src/common/validators/file-type.validator';
import { FirstPageCacheInterceptor } from './interceptors/first-page-cache.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';
import { JwtStrongAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from './interfaces/request.interface';
import { CommentsAuthInterceptor } from './interceptors/comments-owner.interceptor';
import { JwtOptionalAuthGuard } from '../auth/guards/jwt-auth.optional.guard';
import { CaptchaGuard } from '../../common/guards/captcha.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('create')
  @UseGuards(CaptchaGuard, JwtStrongAuthGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @UseFilters(MulterExceptionFilter)
  async create(
    @Body() body: CreateCommentDto,
    @Req() req: RequestWithUser,
    @UploadedFile(FileSignaturePipe)
    file?: Express.Multer.File,
  ): Promise<CommentResponseDto> {
    const fingerprint = req.user.fingerprint;

    const comment = await this.commentsService.create(body, fingerprint, file);

    return comment;
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  @UseInterceptors(CommentsAuthInterceptor, FirstPageCacheInterceptor)
  @CacheTTL(30000)
  async getAll(
    @Query('limit') limit: number = 10,
    @Query('cursor') cursorId?: number,
    @Query('direction') direction: 'next' | 'prev' = 'next',
  ): Promise<CommentResponseDto[]> {
    const comments = await this.commentsService.findAll(
      limit,
      cursorId,
      direction,
    );
    return comments;
  }

  @Delete(':id')
  @UseGuards(JwtStrongAuthGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    const fingerprint = req.user.fingerprint;
    return await this.commentsService.remove(id, fingerprint);
  }
}

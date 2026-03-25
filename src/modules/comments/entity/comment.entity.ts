import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { FileEntity } from '../../files/entity/file.entity';

@Entity('comments')
@Index('IDX_comments_parent_id_id', ['parentId', 'id'])
@Index('IDX_comments_root_id_created_at', ['rootId', 'createdAt'])
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ nullable: true, default: null })
  rootId: number;

  @Column()
  authorId: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'authorId' })
  author: UserEntity;

  @Column({ nullable: true })
  fileId: number;

  @OneToOne(() => FileEntity, (file) => file.comment, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'fileId' })
  file: FileEntity;

  @Column({ nullable: true })
  parentId: number;

  @Index('IDX_comments_fingerprint')
  @Column()
  fingerprint: string;

  @ManyToOne(() => CommentEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: CommentEntity;

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  replies: CommentEntity[];
}

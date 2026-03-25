import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentEntity } from '../../comments/entity/comment.entity';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_files_filename', { unique: true })
  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column({ nullable: true })
  mimetype: string;

  @Column({
    type: 'bigint',
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseInt(value, 10),
    },
  })
  size: number;

  @Column({ default: false })
  isLoaded: boolean;

  @OneToOne(() => CommentEntity, (comment) => comment.file)
  comment: CommentEntity;

  @CreateDateColumn({
    type: 'timestamptz',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

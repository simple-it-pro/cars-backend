import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import User from './user.entity';
import { PostStatus } from '../enums';

@Entity({ name: 'posts' })
class Post {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор поста',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата удаления поста',
        required: false,
    })
    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt?: Date | null;

    @ApiProperty({
        example: 'Это мой новый пост о машинах!',
        description: 'Текст поста',
    })
    @Column({ type: 'text' })
    content: string;

    @ApiProperty({
        example: PostStatus.PENDING,
        enum: PostStatus,
        description: 'Статус модерации поста',
    })
    @Column({
        type: 'enum',
        enum: PostStatus,
        default: PostStatus.PENDING,
    })
    status: PostStatus;

    @ApiProperty({
        example: 'Пост содержит недопустимый контент',
        description: 'Причина отклонения (заполняется модератором)',
        required: false,
    })
    @Column({ type: 'text', nullable: true })
    rejectionReason?: string | null;

    @ApiProperty({
        description: 'Автор поста',
    })
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'uuid' })
    userId: string;
}

export default Post;

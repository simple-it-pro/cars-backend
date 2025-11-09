import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
    OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

import { PostStatusEnum } from '../enums';
import { Hashtag, User, PostFile } from '.';

@Entity({ name: 'posts' })
class Post {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор поста',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Заголовок поста',
        description: 'Заголовок поста',
    })
    @Column()
    title: string;

    @ApiProperty({
        example: 'Текстовое содержимое поста',
        description: 'Текстовое содержимое поста',
    })
    @Column('text')
    @Length(1, 1000, { message: 'Описание должно быть от 1 до 1000 символов' })
    description: string;

    @ApiProperty({
        example: PostStatusEnum.DRAFT,
        enum: PostStatusEnum,
        description: 'Статус поста. Может быть: DRAFT, PUBLISHED',
    })
    @Column({
        type: 'enum',
        enum: PostStatusEnum,
        default: PostStatusEnum.DRAFT,
    })
    status: PostStatusEnum;

    @ApiProperty({ example: '2025-09-14T08:57:59.589Z' })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToMany(() => PostFile, (postFile) => postFile.post, {
        cascade: ['insert', 'update'],
    })
    files: PostFile[];

    @ManyToOne(() => User, (user) => user.posts, { onDelete: 'SET NULL' })
    user: User;

    @ManyToMany(() => Hashtag, (hashtag) => hashtag.posts)
    @JoinTable()
    hashtags: Hashtag[];
}

export default Post;

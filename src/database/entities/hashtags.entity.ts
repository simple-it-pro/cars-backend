import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Post } from './';

@Entity({ name: 'hashtags' })
class Hashtag {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор тега',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'Тег',
        description: 'Название тега',
    })
    @Column({ unique: true })
    name: string;

    @ApiProperty({ example: '2025-09-14T08:57:59.589Z' })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ManyToMany(() => Post, (post) => post.hashtags)
    posts: Post[];
}

export default Hashtag;

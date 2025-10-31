import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    CreateDateColumn,
    JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import Message from './message.entity';
import { Asset } from '../interfaces';

@Entity({ name: 'message_contents' })
class MessageContent {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: '2025-09-14T08:57:59.589Z' })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({ type: () => Message })
    @ManyToOne(() => Message, (message) => message.contentHistory, {
        onDelete: 'CASCADE',
    })
    @JoinColumn()
    message: Message;

    @ApiProperty({ example: 'Привет! Как дела?' })
    @Column('text')
    content: string;

    @ApiProperty({
        example: [
            {
                type: 'image',
                url: 'https://example.com/image.jpg',
                name: 'photo.jpg',
                size: 1024000,
            },
        ],
    })
    @Column('jsonb', { default: [] })
    attachments: Array<Asset>;

    @ApiProperty({ example: 1 })
    @Column({ default: 1 })
    version: number;
}

export default MessageContent;

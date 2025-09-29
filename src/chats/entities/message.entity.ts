import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn, JoinColumn,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Message {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Уникальный идентификатор сообщения',
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
    type: () => Chat,
    description: 'Чат, к которому относится сообщение',
  })
  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn()
  chat: Chat;

  @ApiProperty({
    type: () => User,
    description: 'Отправитель сообщения',
  })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  sender: User;

  @ApiProperty({
    example: 'Привет! Как дела?',
    description: 'Текст сообщения',
  })
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
    description: 'Вложения к сообщению',
  })
  @Column('jsonb', { default: [] })
  attachments: Array<{
    type: 'image' | 'video' | 'file';
    url: string;
    name: string;
    size: number;
  }>;

  @ApiProperty({
    example: false,
    description: 'Прочитано ли сообщение',
  })
  @Column({ default: false })
  isRead: boolean;

  @ApiProperty({
    example: false,
    description: 'Удалено ли сообщение',
  })
  @Column({ default: false })
  isDeleted: boolean;
}

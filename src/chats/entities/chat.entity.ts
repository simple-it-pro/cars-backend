import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.entity';
import { UnreadChat } from './unread-chat.entity';

@Entity()
export class Chat {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Уникальный идентификатор чата',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '2025-09-14T08:57:59.589Z',
  })
  @Index('idx_chat_created_at')
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-14T08:57:59.589Z',
  })
  @Index('idx_chat_updated_at')
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({
    example: 'private',
    description: 'Тип чата',
    enum: ['private', 'group'],
  })
  @Column({ default: 'private' })
  type: 'private' | 'group';

  @ApiProperty({
    example: 'Мой групповой чат',
    description: 'Название чата (для групповых)',
    required: false,
  })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({
    example: 'Описание группового чата',
    description: 'Описание чата (для групповых)',
    required: false,
  })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({
    example: 'user1_user2',
    description: 'Уникальный ключ чата',
  })
  @Column({ unique: true })
  @Index('idx_chat_unique_key')
  uniqueKey: string;

  @ApiProperty({
    example: 'Привет! Как дела?',
    description: 'Текст последнего сообщения',
    required: false,
  })
  @Column({ nullable: true })
  lastMessageContent?: string;

  @ApiProperty({
    example: '2025-09-14T08:57:59.589Z',
    description: 'Время создания последнего сообщения',
    required: false,
  })
  @Index('idx_chat_last_message_created_at')
  @Column({ nullable: true, type: 'timestamptz' })
  lastMessageCreatedAt?: Date;

  @ApiProperty({
    type: () => User,
    description: 'Создатель чата',
    required: false,
  })
  @ManyToOne(() => User, { nullable: true })
  createdBy?: User;

  @ApiProperty({
    type: () => [User],
    description: 'Участники чата',
  })
  @ManyToMany(() => User, (user) => user.chats)
  @JoinTable({
    name: 'chat_users',
    joinColumn: { name: 'chat_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: User[];

  @ManyToMany(() => User, (user) => user.favoriteChats)
  favoritedBy: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  @OneToMany(() => UnreadChat, (unreadChat) => unreadChat.chat)
  unreadChats: UnreadChat[];
}

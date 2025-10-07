import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.entity';

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
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-14T08:57:59.589Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({
    type: () => User,
    description: 'Первый участник чата',
  })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  userA: User;

  @ApiProperty({
    type: () => User,
    description: 'Второй участник чата',
  })
  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  userB: User;

  @ApiProperty({
    example: 'user1_user2',
    description: 'Уникальный ключ чата',
  })
  @Column({ unique: true })
  @Index()
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
  @Column({ nullable: true })
  lastMessageCreatedAt?: Date;

  @ApiProperty({
    example: 3,
    description: 'Количество непрочитанных сообщений для первого пользователя',
  })
  @Column({ default: 0 })
  unreadCountForUserA: number;

  @ApiProperty({
    example: 0,
    description: 'Количество непрочитанных сообщений для второго пользователя',
  })
  @Column({ default: 0 })
  unreadCountForUserB: number;

  @ApiProperty({
    example: false,
    description: 'Добавлен ли чат в избранное у первого пользователя',
  })
  @Column({ default: false })
  isFavoriteForUserA: boolean;

  @ApiProperty({
    example: false,
    description: 'Добавлен ли чат в избранное у второго пользователя',
  })
  @Column({ default: false })
  isFavoriteForUserB: boolean;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}

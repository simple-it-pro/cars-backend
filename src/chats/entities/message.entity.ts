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

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn()
  chat: Chat;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  sender: User;

  @Column('text')
  content: string;

  @Column('jsonb', { default: [] })
  attachments: Array<{
    type: 'image' | 'video' | 'file';
    url: string;
    name: string;
    size: number;
  }>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isDeleted: boolean;
}

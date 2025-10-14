import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Chat } from './chat.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
@Index(['user', 'chat'], { unique: true })
export class UnreadChat {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2025-09-14T08:57:59.589Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2025-09-14T08:57:59.589Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({ example: 3 })
  @Column({ default: 0 })
  unreadCount: number;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.unreadChats)
  user: User;

  @ApiProperty({ type: () => Chat })
  @ManyToOne(() => Chat, (chat) => chat.unreadChats)
  chat: Chat;
}

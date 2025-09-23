import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from './message.entity';

@Entity()
export class Chat {
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

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  userA: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  userB: User;

  @Column({ unique: true })
  @Index()
  uniqueKey: string;

  @Column({ nullable: true })
  lastMessageContent?: string;

  @Column({ nullable: true })
  lastMessageCreatedAt?: Date;

  @Column({ default: 0 })
  unreadCountForUserA: number;

  @Column({ default: 0 })
  unreadCountForUserB: number;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}

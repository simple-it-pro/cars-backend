import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/types/roles';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Chat } from '../../chats/entities/chat.entity';
import { Message } from '../../chats/entities/message.entity';
import { UnreadChat } from '../../chats/entities/unread-chat.entity';
import { Image } from '../../common/types/assets';

@Entity({ name: 'users' })
export class User {
  @ApiProperty({
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

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
    example: UserRole.COMMON,
    enum: UserRole,
    description: 'Роль пользователя',
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.COMMON,
  })
  role: UserRole;

  @ApiProperty({
    example: 'user',
  })
  @Column({ unique: true, nullable: true })
  login: string;

  @Column({ nullable: true })
  @Exclude()
  password: string;

  @ApiProperty({
    example: 'John',
  })
  @Column({ nullable: true, unique: true })
  nickname: string;

  @ApiProperty({
    example: 'John Doe',
  })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({
    example: '2000-09-01T08:57:59.589Z',
  })
  @Column({ nullable: true, type: 'timestamptz' })
  birthdate: Date;

  @ApiProperty({
    example: 'example@example.com',
  })
  @Column({
    unique: true,
    nullable: true,
    length: 255,
  })
  email: string;

  @ApiProperty({
    example: '+79991234567',
    description: 'Номер телефона',
  })
  @Column({
    nullable: false,
    unique: true,
    length: 20,
  })
  phone: string;

  @ApiProperty({
    example: 'Москва',
  })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({
    example: 'Я новичок в этом деле, но уже имею опыт и хорошие авто в гараже',
  })
  @Column({ nullable: true })
  about: string;

  @ApiProperty({
    example: {
      url: 'https://example.com/image.jpg',
      name: 'photo.jpg',
      size: 1024000,
    },
  })
  @Column({ type: 'jsonb', nullable: true })
  image: Image;

  @ManyToMany(() => Chat, (chat) => chat.users)
  chats: Chat[];

  @ManyToMany(() => Chat, (chat) => chat.favoritedBy)
  @JoinTable({
    name: 'favorite_chats',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'chat_id', referencedColumnName: 'id' },
  })
  favoriteChats: Chat[];

  @OneToMany(() => UnreadChat, (unreadChat) => unreadChat.user)
  unreadChats: UnreadChat[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => Review, (review) => review.author)
  authoredReviews: Review[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToMany,
    JoinTable,
    DeleteDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../../common/types/roles';
import RefreshToken from './refresh-token.entity';
import Review from './review.entity';
import Chat from './chat.entity';
import Message from './message.entity';
import UnreadChat from './unread-chat.entity';
import { Image } from '../interfaces';
import { Follower, Subscription } from './subscription.entity';

@Entity({ name: 'users' })
class User {
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
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата удаления профиля',
        required: false,
    })
    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt?: Date | null;

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
    @Column({ nullable: true, unique: true, length: 30 })
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
        example:
            'Я новичок в этом деле, но уже имею опыт и хорошие авто в гараже',
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

    @ApiProperty({
        example: 5,
    })
    @Column({ type: 'float', nullable: true })
    rating: number;

    @ApiProperty({
        example: false,
    })
    @Column({ default: false })
    isDeactivated: boolean;

    @ManyToMany(() => Chat, (chat) => chat.users)
    chats: Chat[];

    @ManyToMany(() => Chat, (chat) => chat.favoritedBy)
    @JoinTable({
        name: 'favorite_chats',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'chat_id', referencedColumnName: 'id' },
    })
    favoriteChats: Chat[];

    @OneToMany(() => Subscription, (subscription) => subscription.user)
    subscriptions: Subscription[];

    @OneToMany(() => Follower, (follower) => follower.follower)
    followers: Follower[];

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

export default User;

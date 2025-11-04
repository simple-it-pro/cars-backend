import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';
import { User } from './';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'public_profile_views' })
class PublicProfileView {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор просмотра публичного профиля',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата и время просмотра публичного профиля',
    })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: 1,
        description: 'ID пользователя, чей публичный профиль был просмотрен',
    })
    @Column()
    userId: number;

    @ApiProperty({
        example: 'john-doe',
        description: 'Слаг публичного профиля, который был просмотрен',
    })
    @Column({ nullable: true })
    slug: string;

    @ApiProperty({
        example: '192.168.0.0',
        description: 'IP-адрес посетителя, просмотревшего публичный профиль',
    })
    @Column({ nullable: true })
    ip: string;

    @ApiProperty({
        example:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
        description: 'User-Agent посетителя, просмотревшего публичный профиль',
    })
    @Column({ type: 'text', nullable: true })
    userAgent: string;

    @ApiProperty({
        example: 'https://example.com/previous-page',
        description:
            'Реферер, с которого посетитель перешел на публичный профиль',
    })
    @Column({ type: 'text', nullable: true })
    referer: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}

export default PublicProfileView;

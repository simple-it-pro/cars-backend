import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import User from './user.entity';

@Entity({ name: 'refresh_tokens' })
class RefreshToken {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Хэш refresh token' })
    @Column()
    tokenHash: string;

    @ApiProperty({
        example: '2025-09-21T08:57:59.589Z',
        description: 'Время истечения',
    })
    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @ApiProperty({ example: '2025-09-14T08:57:59.589Z' })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({ example: 'Chrome 115' })
    @Column({ nullable: true })
    userAgent?: string;

    @ApiProperty({ example: '192.168.1.1' })
    @Column({ nullable: true })
    ipAddress?: string;

    @ManyToOne(() => User, (user) => user.refreshTokens, {
        onDelete: 'CASCADE',
    })
    user: User;

    @Column()
    userId: string;

    @Column({ unique: true })
    tokenId: string;
}

export default RefreshToken;

import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '.';
import { numericToNumber } from '../utils';

@Entity({ name: 'feed_item' })
class FeedItem {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор чата',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @Index('idx_feed_item_created_at')
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @Index('idx_feed_item_updated_at')
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ApiPropertyOptional({
        example: 123.45,
        description: 'Оценка рекомендуемости',
    })
    @Column({
        name: 'rank_score',
        type: 'numeric',
        precision: 12,
        scale: 2,
        nullable: true,
        transformer: numericToNumber,
    })
    rankScore?: number | null;

    @ApiProperty({
        example: true,
        description: 'Активна ли новость',
    })
    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User)
    author: User;
}

export default FeedItem;

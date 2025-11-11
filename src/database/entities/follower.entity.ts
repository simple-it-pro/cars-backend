import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './index';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'followers' })
class Follower {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: '2025-10-31T12:00:00.000Z' })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.followers)
    @JoinColumn({ name: 'follower_id' })
    follower: User;

    @ManyToOne(() => User, (user) => user.followers)
    @JoinColumn({ name: 'subscribed_user_id' })
    subscribedUser: User;
}

export default Follower;

import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'subscriptions' })
class Subscription {
    @ApiProperty({ example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ example: '2025-10-31T12:00:00.000Z' })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.subscriptions)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, (user) => user.subscriptions)
    @JoinColumn({ name: 'subscribed_user_id' })
    subscribedUser: User;
}

export default Subscription;

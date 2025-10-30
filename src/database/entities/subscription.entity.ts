import {
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './';

@Entity({ name: 'subscriptions' })
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.subscriptions)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => User, (user) => user.subscriptions)
    @JoinColumn({ name: 'subscribed_user_id' })
    subscribedUser: User;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}

@Entity({ name: 'followers' })
export class Follower {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.followers)
    @JoinColumn({ name: 'follower_id' })
    follower: User;

    @ManyToOne(() => User, (user) => user.followers)
    @JoinColumn({ name: 'subscribed_user_id' })
    subscribedUser: User;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}

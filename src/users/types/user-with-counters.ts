import { User } from 'src/database/entities';

export interface UserWithCounters extends User {
    counters: {
        subscriptionsCount: number;
        followersCount: number;
        reviewsCount: number;
    };
}

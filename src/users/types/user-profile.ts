import { UserWithCounters } from './user-with-counters';

export interface UserProfile extends UserWithCounters {
    isBlocked: boolean;
    isSubscribed: boolean;
}

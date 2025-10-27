import { Routes } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { ReviewsModule } from './reviews/reviews.module';

const ROUTES: Routes = [
    {
        path: 'auth',
        module: AuthModule,
    },
    {
        path: 'users',
        module: UsersModule,
    },
    {
        path: 'chats',
        module: ChatsModule,
    },
    {
        path: 'reviews',
        module: ReviewsModule,
    },
];

export default ROUTES;

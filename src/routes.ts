import { Routes } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PostsModule } from './posts/posts.module';
import { FilesModule } from './files/files.module';

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
    {
        path: 'posts',
        module: PostsModule,
    },
    {
        path: 'files',
        module: FilesModule,
    },
];

export default ROUTES;

import { Routes } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

const ROUTES: Routes = [
    {
        path: 'auth',
        module: AuthModule,
    },
    {
        path: 'users',
        module: UsersModule,
    },
];

export default ROUTES;

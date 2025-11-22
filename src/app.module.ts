import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './sms/sms.module';
import { StorageModule } from './storage/storage.module';
import { AdminModule } from './admin/admin.module';
import ROUTES from './routes';

@Module({
    imports: [
        SharedModule,
        AuthModule,
        UsersModule,
        SmsModule,
        StorageModule,
        RouterModule.register(ROUTES),
        AdminModule,
    ],
})
export class AppModule {}

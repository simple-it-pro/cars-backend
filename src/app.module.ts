import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './sms/sms.module';
import { ChatsModule } from './chats/chats.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StorageModule } from './storage/storage.module';
import ROUTES from './routes';

@Module({
    imports: [
        SharedModule,
        AuthModule,
        UsersModule,
        SmsModule,
        ChatsModule,
        ReviewsModule,
        StorageModule,
        RouterModule.register(ROUTES),
    ],
})
export class AppModule {}

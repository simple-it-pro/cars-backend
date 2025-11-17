import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './sms/sms.module';
import { ChatsModule } from './chats/chats.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StorageModule } from './storage/storage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PostsModule } from './posts/posts.module';
import { FilesModule } from './files/files.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import ROUTES from './routes';

@Module({
    imports: [
        HealthModule,
        SharedModule,
        AuthModule,
        UsersModule,
        SmsModule,
        ChatsModule,
        ReviewsModule,
        StorageModule,
        PostsModule,
        FilesModule,
        NotificationsModule,
        AdminModule,
        RouterModule.register(ROUTES),
    ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReviewsService } from './services';
import { ReviewsController } from './controllers';
import { StorageModule } from '../storage/storage.module';
import { User, Review, UserBlock } from '../database/entities';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, User, UserBlock]),
        StorageModule,
        UsersModule,
        NotificationsModule,
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule {}

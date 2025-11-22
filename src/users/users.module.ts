import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingService, SubscriptionsService, UsersService } from './services';
import { SubscriptionsController, UsersController } from './controllers';
import {
    Follower,
    Review,
    Subscription,
    User,
    UserBlock,
} from '../database/entities';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            User,
            Subscription,
            Follower,
            Review,
            UserBlock,
        ]),
        StorageModule,
        NotificationsModule,
    ],
    controllers: [UsersController, SubscriptionsController],
    providers: [UsersService, RatingService, SubscriptionsService],
    exports: [UsersService, RatingService, SubscriptionsService],
})
export class UsersModule {}

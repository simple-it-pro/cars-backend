import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services';
import { UsersController } from './controllers';
import { User, Follower, Subscription, Review } from '../database/entities';
import { StorageModule } from '../storage/storage.module';
import { RatingService } from './services';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Subscription, Follower, Review]),
        StorageModule,
        NotificationsModule,
    ],
    controllers: [UsersController],
    providers: [UsersService, RatingService],
    exports: [UsersService, RatingService],
})
export class UsersModule {}

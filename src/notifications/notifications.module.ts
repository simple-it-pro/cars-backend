import { Module } from '@nestjs/common';
import { NotificationsService } from './services';
import { NotificationsController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../database/entities';

@Module({
    imports: [TypeOrmModule.forFeature([Notification])],
    controllers: [NotificationsController],
    providers: [NotificationsService],
})
export class NotificationsModule {}

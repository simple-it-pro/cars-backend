import { Module } from '@nestjs/common';
import { NotificationsService } from './services';
import { NotificationsController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../database/entities';
import { AuthModule } from '../auth/auth.module';
import { NotificationsGateway } from './gateways';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), AuthModule],
    controllers: [NotificationsController],
    providers: [NotificationsService, NotificationsGateway],
    exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}

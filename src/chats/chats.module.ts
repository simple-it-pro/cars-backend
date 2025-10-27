import { Module } from '@nestjs/common';
import { ChatsService } from './services/chats.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagesService } from './services';
import { ChatsController } from './controllers';
import { ChatsGateway } from './gateways';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import {
    UnreadChat,
    User,
    Message,
    Chat,
    MessageContent,
} from '../database/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Chat,
            Message,
            UnreadChat,
            User,
            MessageContent,
        ]),
        UsersModule,
        AuthModule,
        StorageModule,
    ],
    controllers: [ChatsController],
    providers: [ChatsService, MessagesService, ChatsGateway],
    exports: [ChatsService, MessagesService],
})
export class ChatsModule {}

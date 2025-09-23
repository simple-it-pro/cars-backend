import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { UsersModule } from '../users/users.module';
import { MessagesService } from './messages.service';
import { ChatsGateway } from './chats.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message]), UsersModule, AuthModule],
  controllers: [ChatsController],
  providers: [ChatsService, MessagesService, ChatsGateway],
  exports: [ChatsService, MessagesService],
})
export class ChatsModule {}

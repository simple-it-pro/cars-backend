import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from '../chats/entities/message.entity';
import { MessageContent } from '../chats/entities/message-content.entity';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Chat, Message, MessageContent, Review]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

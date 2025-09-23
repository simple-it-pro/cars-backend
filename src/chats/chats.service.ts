import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async findOrCreateChat(userA: User, userB: User): Promise<Chat> {
    const userIds = [userA.id, userB.id].sort();
    const uniqueKey = `${userIds[0]}-${userIds[1]}`;

    let chat = await this.chatRepository.findOne({
      where: { uniqueKey },
      relations: ['userA', 'userB'],
    });

    if (!chat) {
      chat = this.chatRepository.create({
        userA: userIds[0] === userA.id ? userA : userB,
        userB: userIds[1] === userB.id ? userB : userA,
        uniqueKey,
      });
      chat = await this.chatRepository.save(chat);
    }

    return chat;
  }

  async getUserChats(userId: number): Promise<Chat[]> {
    return this.chatRepository.find({
      where: [{ userA: { id: userId } }, { userB: { id: userId } }],
      order: { lastMessageCreatedAt: 'DESC' },
      relations: ['userA', 'userB'],
    });
  }

  async findChatById(chatId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['userA', 'userB'],
    });

    if (!chat) {
      throw new NotFoundException('Чат с таким id не найден');
    }

    return chat;
  }
}

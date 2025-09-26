import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository, LessThan } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  CursorPaginationDto,
  parseCompositeCursor,
  createCompositeCursor,
} from '../common/dto/pagination.dto';

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

  async getUserChats(
    userId: number,
    pagination: CursorPaginationDto,
  ): Promise<{ chats: Chat[]; hasMore: boolean; nextCursor?: string }> {
    const limit = pagination.limit || 20;
    const limitPlusOne = limit + 1;

    let whereCondition: any = [
      { userA: { id: userId } },
      { userB: { id: userId } },
    ];

    if (pagination.cursor) {
      const { date, id } = parseCompositeCursor(pagination.cursor);
      whereCondition = [
        {
          userA: { id: userId },
          lastMessageCreatedAt: LessThan(date),
        },
        {
          userB: { id: userId },
          lastMessageCreatedAt: LessThan(date),
        },
        {
          userA: { id: userId },
          lastMessageCreatedAt: date,
          id: LessThan(id),
        },
        {
          userB: { id: userId },
          lastMessageCreatedAt: date,
          id: LessThan(id),
        },
      ];
    }

    const chats = await this.chatRepository.find({
      where: whereCondition,
      order: { lastMessageCreatedAt: 'DESC', id: 'DESC' },
      relations: ['userA', 'userB'],
      take: limitPlusOne,
    });

    const hasMore = chats.length > limit;
    const resultChats = hasMore ? chats.slice(0, limit) : chats;
    const nextCursor =
      hasMore && resultChats.length > 0
        ? createCompositeCursor(
            resultChats[resultChats.length - 1].lastMessageCreatedAt!,
            resultChats[resultChats.length - 1].id,
          )
        : undefined;

    return {
      chats: resultChats,
      hasMore,
      nextCursor,
    };
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

  async getTotalUnreadCount(userId: number): Promise<number> {
    const result = await this.chatRepository
      .createQueryBuilder('chat')
      .select(
        `
        SUM(
          CASE 
            WHEN "chat"."userAId" = :userId THEN "chat"."unreadCountForUserA"
            WHEN "chat"."userBId" = :userId THEN "chat"."unreadCountForUserB"
            ELSE 0
          END
        )`,
        'total',
      )
      .where('"chat"."userAId" = :userId OR "chat"."userBId" = :userId', {
        userId,
      })
      .getRawOne();

    return parseInt(result.total as string) || 0;
  }
}

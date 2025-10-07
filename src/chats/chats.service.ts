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
import { ERROR_MESSAGES } from '../common/constants/messages';

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
    filter: 'all' | 'favorite' | 'unread' = 'all',
    search?: string,
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

    const filtered = chats.filter((chat) => {
      const isUserA = chat.userA.id === userId;
      const isUserB = chat.userB.id === userId;

      if (!isUserA && !isUserB) return false;

      if (filter === 'unread') {
        const unreadCount = isUserA
          ? chat.unreadCountForUserA
          : chat.unreadCountForUserB;
        if (!unreadCount || unreadCount <= 0) return false;
      }

      if (filter === 'favorite') {
        const isFavorite = isUserA
          ? chat.isFavoriteForUserA
          : chat.isFavoriteForUserB;
        if (!isFavorite) return false;
      }

      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        const otherUser = isUserA ? chat.userB : chat.userA;
        const name = (otherUser.name || otherUser.nickname || '')
          .toString()
          .toLowerCase();
        if (!name.includes(query)) return false;
      }

      return true;
    });

    const hasMore = filtered.length > limit;
    const resultChats = hasMore ? filtered.slice(0, limit) : filtered;

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
      throw new NotFoundException(ERROR_MESSAGES.CHAT.NOT_FOUND);
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

  async toggleFavorite(chatId: string, userId: number): Promise<Chat> {
    const chat = await this.findChatById(chatId);

    const isUserA = chat.userA.id === userId;
    const isUserB = chat.userB.id === userId;

    if (!isUserA && !isUserB) {
      throw new NotFoundException(ERROR_MESSAGES.CHAT.NOT_FOUND);
    }

    if (isUserA) {
      chat.isFavoriteForUserA = !chat.isFavoriteForUserA;
    } else {
      chat.isFavoriteForUserB = !chat.isFavoriteForUserB;
    }

    await this.chatRepository.save(chat);
    return chat;
  }
}

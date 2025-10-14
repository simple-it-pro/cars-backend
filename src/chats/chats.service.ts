import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from './entities/chat.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  createCompositeCursor,
  CursorPaginationDto,
  parseCompositeCursor,
} from '../common/dto/pagination.dto';
import { ERROR_MESSAGES } from '../common/constants/messages';
import { UnreadChat } from './entities/unread-chat.entity';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(UnreadChat)
    private readonly unreadChatRepository: Repository<UnreadChat>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {}

  async findOrCreatePrivateChat(userA: User, userB: User): Promise<Chat> {
    const userIds = [userA.id, userB.id].sort();
    const uniqueKey = `private_${userIds[0]}-${userIds[1]}`;

    let chat = await this.chatRepository.findOne({
      where: { uniqueKey },
      relations: ['users'],
    });
    if (chat) {
      return chat;
    }

    chat = this.chatRepository.create({
      type: 'private',
      users: [userA, userB],
      uniqueKey,
    });

    try {
      const savedChat = await this.chatRepository.save(chat);
      await this.initializeChatData(savedChat, [userA, userB]);
      return savedChat;
    } catch (err: any) {
      if (err?.code === '23505') {
        const existing = await this.chatRepository.findOne({
          where: { uniqueKey },
          relations: ['users'],
        });
        if (existing) return existing;
      }
      throw err;
    }
  }

  async createGroupChat(
    userId: number,
    createGroupChatDto: CreateGroupChatDto,
  ): Promise<Chat> {
    const { name, userIds, description } = createGroupChatDto;

    const creator = await this.usersService.getUserById(userId);
    if (!creator) {
      throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const participantIds = [...new Set(userIds)].filter((id) => id !== userId);

    const participants = await Promise.all(
      participantIds.map((id) => this.usersService.getUserById(id)),
    );
    const foundParticipants = participants.filter(Boolean) as User[];

    if (foundParticipants.length !== participantIds.length) {
      const foundIds = new Set(foundParticipants.map((p) => p.id));
      const notFoundIds = participantIds.filter((id) => !foundIds.has(id));
      throw new BadRequestException(
        `${ERROR_MESSAGES.USER.SOME_NOT_FOUND_WITH_IDS_PREFIX}${notFoundIds.join(', ')}`,
      );
    }

    const allUsers = [creator, ...foundParticipants];

    const uniqueKey = `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const chat = this.chatRepository.create({
      type: 'group',
      name,
      description,
      uniqueKey,
      createdBy: creator,
      users: allUsers,
    });

    const savedChat = await this.chatRepository.save(chat);
    await this.initializeChatData(savedChat, allUsers);

    return savedChat;
  }

  private async initializeChatData(chat: Chat, users: User[]): Promise<void> {
    const unreadChats = users.map((user) =>
      this.unreadChatRepository.create({
        user,
        chat,
        unreadCount: 0,
      }),
    );
    await this.unreadChatRepository.save(unreadChats);
  }

  async getUserChats(
    userId: number,
    pagination: CursorPaginationDto,
    filter: 'all' | 'favorite' | 'unread' = 'all',
    search?: string,
  ): Promise<{ chats: Chat[]; hasMore: boolean; nextCursor?: string }> {
    const limit = pagination.limit || 20;
    const limitPlusOne = limit + 1;

    const qb = this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.users', 'cu', 'cu.id = :userId', { userId });

    if (pagination.cursor) {
      const { date, id } = parseCompositeCursor(pagination.cursor);
      qb.andWhere(
        `
        (
          COALESCE(chat."lastMessageCreatedAt", chat."createdAt") < :date
          OR (
            COALESCE(chat."lastMessageCreatedAt", chat."createdAt") = :date
            AND chat.id < :id
          )
        )
      `,
        { date, id },
      );
    }

    if (filter === 'favorite') {
      qb.andWhere((sub) => {
        const sq = sub
          .subQuery()
          .select('1')
          .from('favorite_chats', 'fc')
          .where('fc.chat_id = chat.id')
          .andWhere('fc.user_id = :userId')
          .getQuery();
        return `EXISTS (${sq})`;
      });
    }

    if (filter === 'unread') {
      qb.andWhere((sub) => {
        const sq = sub
          .subQuery()
          .select('1')
          .from(UnreadChat, 'uc')
          .where('uc.chatId = chat.id')
          .andWhere('uc.userId = :userId')
          .andWhere('uc.unreadCount > 0')
          .getQuery();
        return `EXISTS (${sq})`;
      });
    }

    if (search?.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      qb.andWhere(
        `
        LOWER(chat.name) LIKE :term
        OR EXISTS (
          SELECT 1
          FROM chat_users cu2
          JOIN users u ON u.id = cu2.user_id
          WHERE cu2.chat_id = chat.id
            AND u.id <> :userId
            AND (LOWER(u.name) LIKE :term OR LOWER(u.nickname) LIKE :term)
        )
      `,
        { term, userId },
      );
    }

    qb.orderBy(
      'COALESCE(chat."lastMessageCreatedAt", chat."createdAt")',
      'DESC',
    )
      .addOrderBy('chat.id', 'DESC')
      .select('chat.id', 'id')
      .distinct(true)
      .limit(limitPlusOne);

    const rows = await qb.getRawMany<{ id: string }>();
    const ids = rows.map((r) => r.id);
    const hasMore = ids.length > limit;
    const pageIds = hasMore ? ids.slice(0, limit) : ids;

    if (pageIds.length === 0) {
      return { chats: [], hasMore: false };
    }

    const chats = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.users', 'users')
      .leftJoinAndSelect(
        'chat.unreadChats',
        'unreadChats',
        'unreadChats.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('chat.createdBy', 'createdBy')
      .where('chat.id IN (:...ids)', { ids: pageIds })
      .getMany();

    const order = new Map(pageIds.map((id, idx) => [id, idx]));
    chats.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

    const last = chats[chats.length - 1];
    const nextCursor =
      hasMore && last
        ? createCompositeCursor(
            last.lastMessageCreatedAt ?? last.createdAt,
            last.id,
          )
        : undefined;

    return { chats, hasMore, nextCursor };
  }

  async findChatById(chatId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['users', 'createdBy'],
    });
    if (!chat) {
      throw new NotFoundException(ERROR_MESSAGES.CHAT.NOT_FOUND);
    }
    return chat;
  }

  async getTotalUnreadCount(userId: number): Promise<number> {
    const result = await this.unreadChatRepository
      .createQueryBuilder('unreadChat')
      .select('COALESCE(SUM(unreadChat.unreadCount), 0)', 'total')
      .where('unreadChat.userId = :userId', { userId })
      .getRawOne<{ total: string }>();

    return Number(result?.total ?? 0);
  }

  async toggleFavorite(
    chatId: string,
    userId: number,
  ): Promise<{ isFavorite: boolean }> {
    const chat = await this.findChatById(chatId);

    const isParticipant = chat.users.some((user) => user.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteChats'],
    });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    const isCurrentlyFavorite = user.favoriteChats.some(
      (favChat) => favChat.id === chatId,
    );

    if (isCurrentlyFavorite) {
      user.favoriteChats = user.favoriteChats.filter(
        (favChat) => favChat.id !== chatId,
      );
      await this.userRepository.save(user);
      return { isFavorite: false };
    } else {
      user.favoriteChats.push(chat);
      await this.userRepository.save(user);
      return { isFavorite: true };
    }
  }
}

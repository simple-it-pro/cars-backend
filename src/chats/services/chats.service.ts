import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateGroupChatDto } from '../dto';
import {
    createCompositeCursor,
    CursorPaginationDto,
    parseCompositeCursor,
} from '../../common/dto';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { UsersService } from '../../users/services';
import {
    User,
    Chat,
    UnreadChat,
    Message,
    UserBlock,
} from '../../database/entities';
import { StorageService } from '../../storage/services';

@Injectable()
export class ChatsService {
    constructor(
        @InjectRepository(Chat)
        private readonly chatRepository: Repository<Chat>,
        @InjectRepository(UnreadChat)
        private readonly unreadChatRepository: Repository<UnreadChat>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserBlock)
        private readonly userBlockRepository: Repository<UserBlock>,
        private readonly usersService: UsersService,
        private readonly storageService: StorageService,
    ) {}

    private async isUserBlocked(
        userId: string,
        targetUserId: string,
    ): Promise<boolean> {
        const block = await this.userBlockRepository.findOne({
            where: {
                user: { id: userId },
                blockedUser: { id: targetUserId },
            },
        });
        return Boolean(block);
    }

    private async checkMutualBlock(
        userAId: string,
        userBId: string,
    ): Promise<void> {
        const [aBlocksB, bBlocksA] = await Promise.all([
            this.isUserBlocked(userAId, userBId),
            this.isUserBlocked(userBId, userAId),
        ]);

        if (aBlocksB || bBlocksA) {
            throw new ForbiddenException(
                ERROR_MESSAGES.USER.BLOCKED_INTERACTION,
            );
        }
    }

    async findOrCreatePrivateChat(userA: User, userB: User): Promise<Chat> {
        await this.checkMutualBlock(userA.id, userB.id);

        const uniqueKey = `private_${userA.id}-${userB.id}`;

        let chat = await this.chatRepository.findOne({
            where: { uniqueKey },
            relations: ['users'],
        });
        if (chat) return chat;

        chat = this.chatRepository.create({
            type: 'private',
            users: [userA, userB],
            uniqueKey,
        });

        try {
            const savedChat = await this.chatRepository.save(chat);
            await this.initializeChatData(savedChat, [userA, userB]);
            return savedChat;
        } catch (err) {
            const existing = await this.chatRepository.findOne({
                where: { uniqueKey },
                relations: ['users'],
            });
            if (existing) return existing;
            throw err;
        }
    }

    async createGroupChat(
        userId: string,
        createGroupChatDto: CreateGroupChatDto,
    ): Promise<Chat> {
        const { name, userIds, description } = createGroupChatDto;

        const creator = await this.usersService.getUserById(userId);
        if (!creator)
            throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        const participantIds = [...new Set(userIds)].filter(
            (id) => id !== userId,
        );

        const blockedUsers: string[] = [];
        for (const participantId of participantIds) {
            const isBlocked = await this.isUserBlocked(userId, participantId);
            const isBlockedBy = await this.isUserBlocked(participantId, userId);

            if (isBlocked || isBlockedBy) blockedUsers.push(participantId);
        }

        if (blockedUsers.length > 0)
            throw new BadRequestException(
                `${ERROR_MESSAGES.USER.CANNOT_ADD_BLOCKED_USERS}: ${blockedUsers.join(', ')}`,
            );

        const participants = await Promise.all(
            participantIds.map((id) => this.usersService.getUserById(id)),
        );
        const foundParticipants = participants.filter(Boolean) as User[];

        if (foundParticipants.length !== participantIds.length) {
            const foundIds = new Set(foundParticipants.map((p) => p.id));
            const notFoundIds = participantIds.filter(
                (id) => !foundIds.has(id),
            );
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

    private async addSignedUrlsToMessage(message: Message): Promise<Message> {
        if (message.attachments && message.attachments.length > 0) {
            message.attachments = await Promise.all(
                message.attachments.map(async (attachment) => ({
                    ...attachment,
                    url: await this.storageService.getFileUrl(attachment.url),
                })),
            );
        }

        if (message.currentContent?.attachments?.length > 0) {
            message.currentContent.attachments = await Promise.all(
                message.currentContent.attachments.map(async (attachment) => ({
                    ...attachment,
                    url: await this.storageService.getFileUrl(attachment.url),
                })),
            );
        }
        return message;
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
        userId: string,
        pagination: CursorPaginationDto,
        filter: 'all' | 'favorite' | 'unread' = 'all',
        search?: string,
    ): Promise<{
        chats: (Chat & { isFavorite: boolean; isEmpty: boolean })[];
        hasMore: boolean;
        nextCursor?: string;
    }> {
        const limit = pagination.limit || 20;
        const limitPlusOne = limit + 1;

        const qb = this.chatRepository
            .createQueryBuilder('chat')
            .innerJoin('chat.users', 'user', '"user"."id" = :userId', {
                userId,
            })
            .leftJoin('chat.lastMessage', 'lastMessage');

        // скрываем чаты, где есть взаимные блокировки с кем-то из участников
        qb.andWhere((qb) => {
            const subQuery = qb
                .subQuery()
                .select('1')
                .from('user_block', 'ub')
                .innerJoin('chat_users', 'cu', 'cu.user_id = ub.blockedUserId')
                .where('cu.chat_id = chat.id')
                .andWhere('ub.userId = :userId')
                .getQuery();
            return `NOT EXISTS (${subQuery})`;
        });

        if (pagination.cursor) {
            const { date, id } = parseCompositeCursor(pagination.cursor);
            qb.andWhere(
                `
            (
              COALESCE("lastMessage"."createdAt", "chat"."createdAt") < :date
              OR (
                COALESCE("lastMessage"."createdAt", "chat"."createdAt") = :date
                AND "chat"."id" < :id
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
                    .where('"fc"."chat_id" = "chat"."id"')
                    .andWhere('"fc"."user_id" = :userId')
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
                    .where('"uc"."chatId" = "chat"."id"')
                    .andWhere('"uc"."userId" = :userId')
                    .andWhere('"uc"."unreadCount" > 0')
                    .getQuery();
                return `EXISTS (${sq})`;
            });
        }

        if (search?.trim()) {
            const term = `%${search.trim().toLowerCase()}%`;
            qb.leftJoin('chat.users', 'searchUsers').andWhere(
                '(LOWER("chat"."name") LIKE :term OR ' +
                    '("searchUsers"."id" != :userId AND ' +
                    '(LOWER("searchUsers"."name") LIKE :term OR LOWER("searchUsers"."nickname") LIKE :term)))',
                { term, userId },
            );
        }

        qb.orderBy(
            'COALESCE("lastMessage"."createdAt", "chat"."createdAt")',
            'DESC',
        )
            .addOrderBy('"chat"."id"', 'DESC')
            .select('"chat"."id"', 'id')
            .limit(limitPlusOne);

        const rows = await qb.getRawMany<{ id: string }>();
        const ids = rows.map((r) => r.id);
        const hasMore = ids.length > limit;
        const pageIds = hasMore ? ids.slice(0, limit) : ids;

        if (pageIds.length === 0) return { chats: [], hasMore: false };

        const userWithFavorites = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['favoriteChats'],
            select: ['id'],
        });

        const favoriteChatIds = new Set(
            userWithFavorites?.favoriteChats?.map((chat) => chat.id) || [],
        );

        const chats = await this.chatRepository
            .createQueryBuilder('chat')
            .leftJoinAndSelect('chat.users', 'users')
            .leftJoinAndSelect('chat.lastMessage', 'lastMessage')
            .leftJoinAndSelect('lastMessage.sender', 'lastMessageSender')
            .leftJoinAndSelect('lastMessage.currentContent', 'currentContent')
            .leftJoinAndSelect(
                'chat.unreadChats',
                'unreadChats',
                '"unreadChats"."userId" = :userId',
                { userId },
            )
            .leftJoinAndSelect('chat.createdBy', 'createdBy')
            .where('"chat"."id" IN (:...ids)', { ids: pageIds })
            .getMany();

        const chatsWithUrls = await Promise.all(
            chats.map(async (chat) => {
                const hasLastMessage = Boolean(chat.lastMessage);
                if (chat.lastMessage) {
                    const messageWithUrls = await this.addSignedUrlsToMessage(
                        chat.lastMessage,
                    );
                    return {
                        ...chat,
                        lastMessage: messageWithUrls,
                        isFavorite: favoriteChatIds.has(chat.id),
                        isEmpty: !hasLastMessage,
                    };
                }
                return {
                    ...chat,
                    isFavorite: favoriteChatIds.has(chat.id),
                    isEmpty: true,
                };
            }),
        );

        const order = new Map(pageIds.map((id, idx) => [id, idx]));
        chatsWithUrls.sort((a, b) => order.get(a.id)! - order.get(b.id)!);

        const last = chatsWithUrls[chatsWithUrls.length - 1];
        const lastMessageDate = last.lastMessage?.createdAt ?? last.createdAt;
        const nextCursor =
            hasMore && last
                ? createCompositeCursor(lastMessageDate, last.id)
                : undefined;

        return { chats: chatsWithUrls, hasMore, nextCursor };
    }

    async findChatById(
        chatId: string,
        userId: string,
    ): Promise<Chat & { isFavorite?: boolean }> {
        const chat = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: ['users', 'createdBy'],
        });
        if (!chat) throw new NotFoundException(ERROR_MESSAGES.CHAT.NOT_FOUND);

        const isParticipant = chat.users.some((user) => user.id === userId);
        if (!isParticipant)
            throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);

        if (chat.type === 'private') {
            const otherUser = chat.users.find((u) => u.id !== userId);
            if (otherUser) {
                const [isBlocked, isBlockedBy] = await Promise.all([
                    this.isUserBlocked(userId, otherUser.id),
                    this.isUserBlocked(otherUser.id, userId),
                ]);

                if (isBlocked || isBlockedBy)
                    throw new ForbiddenException(
                        ERROR_MESSAGES.USER.BLOCKED_INTERACTION,
                    );
            }
        }

        if (userId) {
            const userWithFavorites = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['favoriteChats'],
                select: ['id'],
            });

            const isFavorite =
                userWithFavorites?.favoriteChats?.some(
                    (favChat) => favChat.id === chatId,
                ) || false;

            return {
                ...chat,
                isFavorite,
            };
        }

        return chat;
    }

    async getTotalUnreadCount(userId: string): Promise<number> {
        const result = await this.unreadChatRepository
            .createQueryBuilder()
            .select('COALESCE(SUM("unreadCount"), 0)', 'total')
            .where('"userId" = :userId', { userId })
            .getRawOne<{ total: string }>();

        return Number(result?.total ?? 0);
    }

    async getUnreadCountForChat(
        userId: string,
        chatId: string,
    ): Promise<number> {
        const result = await this.unreadChatRepository
            .createQueryBuilder()
            .select('COALESCE(SUM("unreadCount"), 0)', 'total')
            .where('"userId" = :userId', { userId })
            .andWhere('"chatId" = :chatId', { chatId })
            .getRawOne<{ total: string }>();

        return Number(result?.total ?? 0);
    }

    async toggleFavorite(
        chatId: string,
        userId: string,
    ): Promise<{ isFavorite: boolean }> {
        const chat = await this.findChatById(chatId, userId);

        const isParticipant = chat.users.some((user) => user.id === userId);
        if (!isParticipant)
            throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);

        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['favoriteChats'],
        });
        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

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

    async markAllChatsAsRead(
        userId: string,
    ): Promise<{ success: boolean; message: string }> {
        return await this.chatRepository.manager.transaction(
            async (manager) => {
                const userChats = await manager
                    .createQueryBuilder(Chat, 'chat')
                    .innerJoin('chat.users', 'user', 'user.id = :userId', {
                        userId,
                    })
                    .getMany();

                const chatIds = userChats.map((chat) => chat.id);

                if (chatIds.length === 0) {
                    return {
                        success: true,
                        message: SUCCESS_MESSAGES.CHAT.ALL_MARKED_READ,
                    };
                }

                await manager
                    .createQueryBuilder()
                    .update(Message)
                    .set({ isRead: true })
                    .where('chatId IN (:...chatIds)', { chatIds })
                    .andWhere('isDeleted = false')
                    .andWhere('isRead = false')
                    .andWhere('senderId != :userId', { userId })
                    .execute();

                await manager
                    .createQueryBuilder()
                    .update(UnreadChat)
                    .set({ unreadCount: 0 })
                    .where('userId = :userId', { userId })
                    .andWhere('chatId IN (:...chatIds)', { chatIds })
                    .execute();

                return {
                    success: true,
                    message: SUCCESS_MESSAGES.CHAT.ALL_MARKED_READ,
                };
            },
        );
    }

    async markChatsAsRead(
        userId: string,
        chatIds: string[],
    ): Promise<{ success: boolean; message: string }> {
        return await this.chatRepository.manager.transaction(
            async (manager) => {
                const validChats = await manager
                    .createQueryBuilder(Chat, 'chat')
                    .innerJoin('chat.users', 'user', 'user.id = :userId', {
                        userId,
                    })
                    .where('chat.id IN (:...chatIds)', { chatIds })
                    .getMany();

                const validChatIds = validChats.map((chat) => chat.id);

                if (validChatIds.length === 0) {
                    throw new NotFoundException(ERROR_MESSAGES.CHAT.NOT_FOUND);
                }

                await manager
                    .createQueryBuilder()
                    .update(Message)
                    .set({ isRead: true })
                    .where('chatId IN (:...validChatIds)', { validChatIds })
                    .andWhere('isDeleted = false')
                    .andWhere('isRead = false')
                    .andWhere('senderId != :userId', { userId })
                    .execute();

                await manager
                    .createQueryBuilder()
                    .update(UnreadChat)
                    .set({ unreadCount: 0 })
                    .where('userId = :userId', { userId })
                    .andWhere('chatId IN (:...validChatIds)', { validChatIds })
                    .execute();

                return {
                    success: true,
                    message: SUCCESS_MESSAGES.CHAT.CHATS_MARKED_READ,
                };
            },
        );
    }

    async deleteChats(
        userId: string,
        chatIds: string[],
    ): Promise<{ success: boolean; message: string }> {
        return await this.chatRepository.manager.transaction(
            async (manager) => {
                const userChats = await manager
                    .createQueryBuilder(Chat, 'chat')
                    .innerJoinAndSelect('chat.users', 'users')
                    .where('chat.id IN (:...chatIds)', { chatIds })
                    .getMany();

                if (userChats.length === 0) {
                    throw new NotFoundException(ERROR_MESSAGES.CHAT.NOT_FOUND);
                }

                const validChatIds = userChats.map((chat) => chat.id);

                for (const chat of userChats) {
                    chat.users = chat.users.filter(
                        (user) => user.id !== userId,
                    );

                    if (chat.users.length === 0) {
                        await manager.remove(Chat, chat);
                    } else {
                        await manager.save(Chat, chat);
                    }
                }

                await manager
                    .createQueryBuilder()
                    .delete()
                    .from(UnreadChat)
                    .where('userId = :userId', { userId })
                    .andWhere('chatId IN (:...validChatIds)', { validChatIds })
                    .execute();

                return {
                    success: true,
                    message: SUCCESS_MESSAGES.CHAT.DELETED,
                };
            },
        );
    }
}

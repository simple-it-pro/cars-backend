import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, LessThan, Repository } from 'typeorm';

import {
    Chat,
    Message,
    MessageContent,
    UnreadChat,
    User,
} from '../../database/entities';
import { SendMessageDto } from '../dto';
import {
    createCompositeCursor,
    CursorPaginationDto,
    parseCompositeCursor,
} from '../../common/dto';
import { ERROR_MESSAGES } from '../../common/constants/messages';
import { Asset } from '../../database/interfaces';

@Injectable()
export class MessagesCoreService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Chat)
        private readonly chatRepository: Repository<Chat>,
    ) {}

    // Все методы работы с БД остаются здесь, но без вызовов gateway или attachment service
    async getChatAndEnsureMembership(
        chatId: string,
        userId: number,
    ): Promise<Chat> {
        const chat = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: ['users'],
        });
        if (!chat) throw new NotFoundException(ERROR_MESSAGES.CHAT.NOT_FOUND);

        const isParticipant = chat.users.some((u) => u.id === userId);
        if (!isParticipant)
            throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);

        return chat;
    }

    async getReplyParentOrFail(chatId: string, parentId: string) {
        const parent = await this.messageRepository.findOne({
            where: { id: parentId, chat: { id: chatId }, isDeleted: false },
            relations: ['sender', 'currentContent', 'chat'],
        });
        if (!parent)
            throw new NotFoundException(ERROR_MESSAGES.MESSAGE.NOT_FOUND);

        return parent;
    }

    async getForwardSourceOrFail(sourceId: string, requesterId: number) {
        const source = await this.messageRepository.findOne({
            where: { id: sourceId, isDeleted: false },
            relations: ['sender', 'currentContent', 'chat', 'chat.users'],
        });
        if (!source) {
            throw new NotFoundException(ERROR_MESSAGES.MESSAGE.NOT_FOUND);
        }
        const isMember = source.chat.users.some((u) => u.id === requesterId);
        if (!isMember)
            throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);

        return source;
    }

    async createMessageVersion(
        manager: EntityManager,
        message: Message,
        content: string,
        attachments: Asset[],
        versionNumber: number,
    ): Promise<MessageContent> {
        let version = manager.create(MessageContent, {
            message,
            content,
            attachments,
            version: versionNumber,
        } as Partial<MessageContent>);

        return await manager.save(MessageContent, version);
    }

    async updateUnreadCounts(
        manager: EntityManager,
        chat: Chat,
        senderId: number,
    ): Promise<void> {
        const recipientIds = chat.users
            .filter((u) => u.id !== senderId)
            .map((u) => u.id);

        if (recipientIds.length === 0) return;

        const unreadExisting = await manager.find(UnreadChat, {
            where: {
                chat: { id: chat.id },
                user: { id: In(recipientIds) },
            },
            relations: ['user', 'chat'],
        });

        const byUserId = new Map<number, UnreadChat>(
            unreadExisting.map((row) => [row.user.id, row]),
        );

        const toSave: UnreadChat[] = [];
        for (const rid of recipientIds) {
            const row =
                byUserId.get(rid) ||
                manager.create(UnreadChat, {
                    chat,
                    user: { id: rid } as User,
                    unreadCount: 0,
                });
            row.unreadCount = (row.unreadCount ?? 0) + 1;
            toSave.push(row);
        }
        await manager.save(UnreadChat, toSave);
    }

    async getMessages(
        chatId: string,
        pagination: CursorPaginationDto,
        userId: number,
    ): Promise<{
        messages: Message[];
        hasMore: boolean;
        nextCursor?: string;
    }> {
        await this.getChatAndEnsureMembership(chatId, userId);

        const limit = pagination.limit || 50;
        const limitPlusOne = limit + 1;

        let whereCondition: any = { chat: { id: chatId }, isDeleted: false };
        if (pagination.cursor) {
            const { date, id } = parseCompositeCursor(pagination.cursor);
            whereCondition = [
                {
                    chat: { id: chatId },
                    isDeleted: false,
                    createdAt: LessThan(date),
                },
                {
                    chat: { id: chatId },
                    isDeleted: false,
                    createdAt: date,
                    id: LessThan(id),
                },
            ];
        }

        const messages = await this.messageRepository.find({
            where: whereCondition,
            order: { createdAt: 'DESC', id: 'DESC' },
            take: limitPlusOne,
            relations: [
                'sender',
                'currentContent',
                'repliedMessage',
                'repliedMessage.sender',
                'repliedMessage.currentContent',
                'forwardedFrom',
                'forwardedFrom.sender',
                'forwardedFrom.currentContent',
            ],
        });

        const hasMore = messages.length > limit;
        const result = hasMore ? messages.slice(0, limit) : messages;

        const nextCursor =
            hasMore && result.length > 0
                ? createCompositeCursor(
                      result[result.length - 1].createdAt,
                      result[result.length - 1].id,
                  )
                : undefined;

        return { messages: result, hasMore, nextCursor };
    }

    async markMessagesAsRead(chatId: string, userId: number): Promise<void> {
        await this.getChatAndEnsureMembership(chatId, userId);

        await this.messageRepository.manager.transaction(async (manager) => {
            await manager
                .createQueryBuilder()
                .update(Message)
                .set({ isRead: true })
                .where('chatId = :chatId', { chatId })
                .andWhere('isDeleted = false')
                .andWhere('isRead = false')
                .andWhere('senderId != :userId', { userId })
                .execute();

            const unread = await manager.findOne(UnreadChat, {
                where: { chat: { id: chatId }, user: { id: userId } },
                relations: ['chat', 'user'],
            });
            if (unread) {
                unread.unreadCount = 0;
                await manager.save(UnreadChat, unread);
            }
        });
    }

    async getFullMessage(messageId: string): Promise<Message> {
        const full = await this.messageRepository.findOne({
            where: { id: messageId },
            relations: [
                'sender',
                'currentContent',
                'repliedMessage',
                'repliedMessage.sender',
                'repliedMessage.currentContent',
                'forwardedFrom',
                'forwardedFrom.sender',
                'forwardedFrom.currentContent',
            ],
        });

        if (!full)
            throw new NotFoundException(ERROR_MESSAGES.MESSAGE.RELOAD_FAIL);

        return full;
    }

    validateMessageContent(
        dto: SendMessageDto,
        files?: Express.Multer.File[],
    ): void {
        const hasText = Boolean(dto.content && dto.content.trim().length > 0);
        const hasAttachments = Array.isArray(files) && files.length > 0;

        if (
            !hasText &&
            !hasAttachments &&
            !dto.forwardFromMessageId &&
            !dto.replyToMessageId
        ) {
            throw new BadRequestException(ERROR_MESSAGES.MESSAGE.EMPTY);
        }
    }

    validateVoiceMessage(file: Express.Multer.File): void {
        if (!file) {
            throw new BadRequestException(ERROR_MESSAGES.MESSAGE.FILE_REQUIRED);
        }

        if (!file.mimetype.startsWith('audio/')) {
            throw new BadRequestException(
                ERROR_MESSAGES.MESSAGE.VOICE_REQUIRED,
            );
        }
    }
}

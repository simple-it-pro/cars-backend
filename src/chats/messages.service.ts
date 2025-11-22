import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { User } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import {
  createCompositeCursor,
  CursorPaginationDto,
  parseCompositeCursor,
} from '../common/dto/pagination.dto';
import { ChatsGateway } from './chats.gateway';
import { ERROR_MESSAGES } from '../common/constants/messages';
import { UnreadChat } from './entities/unread-chat.entity';
import { MessageContent } from './entities/message-content.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @Inject(forwardRef(() => ChatsGateway))
    private readonly chatGateway: ChatsGateway,
  ) {}

  private async getChatAndEnsureMembership(
    chatId: string,
    userId: number,
  ): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['users'],
    });
    if (!chat) {
      throw new NotFoundException(ERROR_MESSAGES.CHAT.NOT_FOUND);
    }
    const isParticipant = chat.users.some((u) => u.id === userId);
    if (!isParticipant) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);
    }
    return chat;
  }

  async sendMessage(
    chatId: string,
    sender: User,
    dto: SendMessageDto,
  ): Promise<Message> {
    const hasText = Boolean(dto.content && dto.content.trim().length > 0);
    const hasVoice = Boolean(dto.voiceUrl && dto.voiceUrl.trim().length > 0);

    if (!hasText && !hasVoice) {
      throw new BadRequestException(ERROR_MESSAGES.MESSAGE.EMPTY);
    }

    const chat = await this.getChatAndEnsureMembership(chatId, sender.id);

    const attachments = Array.isArray(dto.attachments) ? dto.attachments : [];
    const type: 'text' | 'voice' = hasVoice ? 'voice' : 'text';
    const normalizedContent = hasText ? dto.content!.trim() : '';

    const saved = await this.messageRepository.manager.transaction(
      async (manager) => {
        let message = manager.create(Message, {
          chat,
          sender,
          content: normalizedContent,
          attachments,
          voiceUrl: hasVoice ? dto.voiceUrl : null,
          type,
          isRead: false,
          isDeleted: false,
        } as Partial<Message>);
        message = await manager.save(Message, message);

        let version = manager.create(MessageContent, {
          message,
          content: normalizedContent,
          attachments,
          version: 1,
        } as Partial<MessageContent>);
        version = await manager.save(MessageContent, version);

        message.currentContent = version;
        message = await manager.save(Message, message);

        await manager.update(
          Chat,
          { id: chat.id },
          {
            lastMessageContent:
              type === 'voice' ? '🎤 Voice message' : normalizedContent,
            lastMessageCreatedAt: message.createdAt,
          },
        );

        const recipientIds = chat.users
          .filter((u) => u.id !== sender.id)
          .map((u) => u.id);

        if (recipientIds.length > 0) {
          const unreadExisting = await manager.find(UnreadChat, {
            where: { chat: { id: chat.id }, user: { id: In(recipientIds) } },
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
              } as Partial<UnreadChat>);
            row.unreadCount = (row.unreadCount ?? 0) + 1;
            toSave.push(row);
          }
          await manager.save(UnreadChat, toSave);
        }

        return message;
      },
    );

    for (const user of chat.users) {
      if (user.id === sender.id) continue;
      this.chatGateway.sendNewMessageNotification(chat.id, saved, user.id);
    }

    const full = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender', 'currentContent'],
    });

    if (!full) {
      throw new NotFoundException(ERROR_MESSAGES.MESSAGE.RELOAD_FAIL);
    }
    return full;
  }

  async getMessages(
    chatId: string,
    pagination: CursorPaginationDto,
    userId: number,
  ): Promise<{ messages: Message[]; hasMore: boolean; nextCursor?: string }> {
    await this.getChatAndEnsureMembership(chatId, userId);

    const limit = pagination.limit || 50;
    const limitPlusOne = limit + 1;

    let whereCondition: any = { chat: { id: chatId }, isDeleted: false };
    if (pagination.cursor) {
      const { date, id } = parseCompositeCursor(pagination.cursor);
      whereCondition = [
        { chat: { id: chatId }, isDeleted: false, createdAt: LessThan(date) },
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
      relations: ['sender', 'currentContent'],
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

    this.chatGateway.sendReadReceipt(chatId, userId);
  }
}

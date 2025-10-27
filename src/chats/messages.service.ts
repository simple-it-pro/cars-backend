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
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages';
import { UnreadChat } from './entities/unread-chat.entity';
import { MessageContent } from './entities/message-content.entity';
import { EditMessageDto } from './dto/edit-message.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @Inject(forwardRef(() => ChatsGateway))
    private readonly chatGateway: ChatsGateway,
    private readonly storageService: StorageService,
  ) {}

  private async getChatAndEnsureMembership(
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

  private async getReplyParentOrFail(chatId: string, parentId: string) {
    const parent = await this.messageRepository.findOne({
      where: { id: parentId, chat: { id: chatId }, isDeleted: false },
      relations: ['sender', 'currentContent', 'chat'],
    });
    if (!parent) throw new NotFoundException(ERROR_MESSAGES.MESSAGE.NOT_FOUND);

    return parent;
  }

  private async getForwardSourceOrFail(sourceId: string, requesterId: number) {
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

  async sendMessage(
    chatId: string,
    sender: User,
    dto: SendMessageDto,
    files?: Express.Multer.File[],
  ): Promise<Message> {
    const hasText = Boolean(dto.content && dto.content.trim().length > 0);
    const hasVoice = Boolean(dto.voiceUrl && dto.voiceUrl.trim().length > 0);
    const hasAttachments =
      Array.isArray(dto.attachments) && dto.attachments.length > 0;

    if (
      !hasText &&
      !hasVoice &&
      !hasAttachments &&
      !dto.forwardFromMessageId &&
      !dto.replyToMessageId
    ) {
      throw new BadRequestException(ERROR_MESSAGES.MESSAGE.EMPTY);
    }

    const chat = await this.getChatAndEnsureMembership(chatId, sender.id);

    const uploadedAttachments: Array<{
      type: 'image' | 'video' | 'file' | 'voice';
      url: string;
      name: string;
      size: number;
    }> = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const fileKey = await this.storageService.uploadFile(file);
        const fileUrl = await this.storageService.getFileUrl(fileKey);

        let fileType: 'image' | 'video' | 'file' | 'voice' = 'file';
        if (file.mimetype.startsWith('image/')) {
          fileType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
          fileType = 'video';
        } else if (file.mimetype.startsWith('audio/')) {
          fileType = 'voice';
        }

        uploadedAttachments.push({
          type: fileType,
          url: fileUrl,
          name: file.originalname,
          size: file.size,
        });
      }
    }

    const dtoAttachments = Array.isArray(dto.attachments)
      ? dto.attachments
      : [];

    const attachments = [...uploadedAttachments, ...dtoAttachments];
    const type: 'text' | 'voice' = hasVoice ? 'voice' : 'text';
    const normalizedContent = hasText ? dto.content!.trim() : '';

    const repliedMessage = dto.replyToMessageId
      ? await this.getReplyParentOrFail(chatId, dto.replyToMessageId)
      : null;

    const forwardedFrom = dto.forwardFromMessageId
      ? await this.getForwardSourceOrFail(dto.forwardFromMessageId, sender.id)
      : null;

    const saved = await this.messageRepository.manager.transaction(
      async (manager) => {
        let message = manager.create(Message, {
          chat,
          sender,
          content: normalizedContent,
          attachments,
          voiceUrl: hasVoice ? dto.voiceUrl! : null,
          type,
          isRead: false,
          isDeleted: false,
          repliedMessage,
          forwardedFrom,
          quotedText: dto.quotedText,
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

        let snippet = normalizedContent;
        if (forwardedFrom && !snippet) {
          snippet = 'Пересланное сообщение';
        } else if (type === 'voice' && !snippet) {
          snippet = 'Голосовое сообщение';
        } else if (repliedMessage && !snippet && type !== 'voice') {
          snippet = 'Ответить';
        }

        await manager.update(
          Chat,
          { id: chat.id },
          {
            lastMessageContent: snippet,
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
              });
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

    if (!full) throw new NotFoundException(ERROR_MESSAGES.MESSAGE.RELOAD_FAIL);

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

  async editMessage(
    chatId: string,
    messageId: string,
    editorId: number,
    dto: EditMessageDto,
  ): Promise<Message> {
    const newTextRaw = (dto.content ?? '').trim();
    if (!newTextRaw.length)
      throw new BadRequestException(ERROR_MESSAGES.MESSAGE.EMPTY);

    const chat = await this.getChatAndEnsureMembership(chatId, editorId);

    return await this.messageRepository.manager.transaction(async (manager) => {
      const message = await manager
        .getRepository(Message)
        .createQueryBuilder('m')
        .setLock('pessimistic_write')
        .where('m.id = :messageId', { messageId })
        .andWhere('m.isDeleted = false')
        .andWhere('m.chatId = :chatId', { chatId })
        .getOne();

      if (!message)
        throw new NotFoundException(ERROR_MESSAGES.MESSAGE.NOT_FOUND);

      const author = await manager
        .getRepository(Message)
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.sender', 'sender')
        .where('m.id = :id', { id: message.id })
        .getOne();

      if (!author || author.sender.id !== editorId)
        throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);

      const withCurrent = await manager.findOne(Message, {
        where: { id: message.id },
        relations: ['currentContent'],
      });

      const prevVersion = withCurrent?.currentContent?.version ?? 0;
      const prevAttachments = withCurrent?.currentContent?.attachments ?? [];
      const prevText =
        withCurrent?.currentContent?.content ?? withCurrent?.content ?? '';

      if (prevText === newTextRaw)
        throw new BadRequestException(ERROR_MESSAGES.MESSAGE.NO_CHANGES);

      const newVersion = await manager.save(
        manager.create(MessageContent, {
          message,
          content: newTextRaw,
          attachments: prevAttachments,
          version: prevVersion + 1,
        }),
      );

      message.content = newTextRaw;
      message.currentContent = newVersion;
      await manager.save(Message, message);

      if (
        chat.lastMessageCreatedAt &&
        message.createdAt &&
        chat.lastMessageCreatedAt.getTime() === message.createdAt.getTime()
      ) {
        await manager.update(
          Chat,
          { id: chat.id },
          { lastMessageContent: newTextRaw },
        );
      }

      const full = await manager.findOne(Message, {
        where: { id: message.id },
        relations: [
          'sender',
          'currentContent',
          'contentHistory',
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

      this.chatGateway.broadcastMessageEdited(chat.id, full);

      return full;
    });
  }

  async deleteMessage(chatId: string, messageId: string, userId: number) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, chat: { id: chatId }, isDeleted: false },
      relations: ['sender'],
    });

    if (!message) throw new NotFoundException(ERROR_MESSAGES.MESSAGE.NOT_FOUND);

    if (message.sender.id !== userId)
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);

    const deletionErrors: string[] = [];

    if (message.attachments && message.attachments.length > 0) {
      for (const attachment of message.attachments) {
        try {
          await this.storageService.deleteFile(attachment.url);
        } catch (error) {
          const errorMsg = `${ERROR_MESSAGES.FILE.DELETION_FAILED}: ${attachment.name || attachment.url}`;
          deletionErrors.push(errorMsg);
          console.error(errorMsg, error);
        }
      }
    }

    if (message.voiceUrl) {
      try {
        await this.storageService.deleteFile(message.voiceUrl);
      } catch (error) {
        const errorMsg = `${ERROR_MESSAGES.FILE.VOICE_DELETION_FAILED}: ${message.voiceUrl}`;
        deletionErrors.push(errorMsg);
        console.error(errorMsg, error);
      }
    }

    message.isDeleted = true;
    await this.messageRepository.save(message);

    if (deletionErrors.length > 0) {
      console.warn(
        `При удалении сообщения ${messageId} возникли ошибки с файлами:`,
        deletionErrors,
      );

      return {
        success: true,
        message: SUCCESS_MESSAGES.MESSAGE.DELETED_WITH_WARNINGS,
        warnings: deletionErrors,
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGES.MESSAGE.DELETED,
    };
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

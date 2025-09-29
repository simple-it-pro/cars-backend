import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Not } from 'typeorm';
import { Message } from './entities/message.entity';
import { Chat } from './entities/chat.entity';
import { User } from '../users/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import {
  CursorPaginationDto,
  parseCompositeCursor,
  createCompositeCursor,
} from '../common/dto/pagination.dto';
import { ChatsGateway } from './chats.gateway';

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

  async sendMessage(
    chat: Chat,
    sender: User,
    dto: SendMessageDto,
  ): Promise<Message> {
    const message = this.messageRepository.create({
      chat,
      sender,
      content: dto.content,
      attachments: dto.attachments || [],
    });

    const savedMessage = await this.messageRepository.save(message);

    await this.updateChatLastMessage(chat, savedMessage);

    await this.incrementUnreadCount(chat, sender);

    await this.sendMessageNotificationToAllParticipants(chat, savedMessage);

    return savedMessage;
  }

  private async sendMessageNotificationToAllParticipants(
    chat: Chat,
    message: Message,
  ) {
    const notifications = [
      this.chatGateway.sendNewMessageNotification(
        chat.id,
        message,
        chat.userA.id,
      ),
      this.chatGateway.sendNewMessageNotification(
        chat.id,
        message,
        chat.userB.id,
      ),
    ];

    await Promise.all(notifications);
  }

  async getMessages(
    chatId: string,
    pagination: CursorPaginationDto,
  ): Promise<{ messages: Message[]; hasMore: boolean; nextCursor?: string }> {
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
      relations: ['sender', 'chat'],
    });

    const hasMore = messages.length > limit;
    const resultMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor =
      hasMore && resultMessages.length > 0
        ? createCompositeCursor(
            resultMessages[resultMessages.length - 1].createdAt,
            resultMessages[resultMessages.length - 1].id,
          )
        : undefined;

    return {
      messages: resultMessages,
      hasMore,
      nextCursor,
    };
  }

  async markMessagesAsRead(chatId: string, userId: number): Promise<void> {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');

    await this.messageRepository.update(
      {
        chat: { id: chatId },
        isRead: false,
        sender: { id: Not(userId) },
      },
      { isRead: true },
    );

    await this.resetUnreadCount(chat, userId);

    this.chatGateway.sendReadReceipt(chatId, userId);
  }

  private async updateChatLastMessage(
    chat: Chat,
    message: Message,
  ): Promise<void> {
    await this.chatRepository.update(chat.id, {
      lastMessageContent: message.content,
      lastMessageCreatedAt: message.createdAt,
    });
  }

  private async incrementUnreadCount(chat: Chat, sender: User): Promise<void> {
    const isSenderUserA = chat.userA.id === sender.id;
    const field = isSenderUserA ? 'unreadCountForUserB' : 'unreadCountForUserA';

    await this.chatRepository.increment({ id: chat.id }, field, 1);
  }

  private async resetUnreadCount(chat: Chat, userId: number): Promise<void> {
    const isUserA = chat.userA.id === userId;
    const field = isUserA ? 'unreadCountForUserA' : 'unreadCountForUserB';

    await this.chatRepository.update(chat.id, { [field]: 0 });
  }
}

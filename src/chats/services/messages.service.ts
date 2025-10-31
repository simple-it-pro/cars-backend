import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { Chat, Message, MessageContent, User } from '../../database/entities';
import { EditMessageDto, SendMessageDto, SendVoiceMessageDto } from '../dto';
import { CursorPaginationDto } from '../../common/dto';
import { ChatsGateway } from '../gateways';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { MessagesAttachmentService } from './messages-attachment.service';
import { MessagesCoreService } from './messages-core.service';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MessagesService {
    constructor(
        private readonly messagesCoreService: MessagesCoreService,
        private readonly messagesAttachmentService: MessagesAttachmentService,
        @Inject(forwardRef(() => ChatsGateway))
        private readonly chatGateway: ChatsGateway,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) {}

    private sendNotificationsToRecipients(
        chat: Chat,
        message: Message,
        senderId: number,
    ): void {
        for (const user of chat.users) {
            if (user.id === senderId) continue;
            this.chatGateway.sendNewMessageNotification(
                chat.id,
                message,
                user.id,
            );
        }
    }

    private async getFullMessageWithUrls(messageId: string): Promise<Message> {
        const full = await this.messagesCoreService.getFullMessage(messageId);
        return this.messagesAttachmentService.addSignedUrlsToMessage(full);
    }

    private async saveAndNotifyMessage(
        transactionCallback: (manager: EntityManager) => Promise<Message>,
        chat: Chat,
        senderId: number,
    ): Promise<Message> {
        const saved =
            await this.messageRepository.manager.transaction(
                transactionCallback,
            );
        this.sendNotificationsToRecipients(chat, saved, senderId);
        return this.getFullMessageWithUrls(saved.id);
    }

    async sendMessage(
        chatId: string,
        sender: User,
        dto: SendMessageDto,
        files?: Express.Multer.File[],
    ): Promise<Message> {
        this.messagesCoreService.validateMessageContent(dto, files);

        const chat = await this.messagesCoreService.getChatAndEnsureMembership(
            chatId,
            sender.id,
        );
        const uploadedAttachments =
            await this.messagesAttachmentService.processMessageAttachments(
                files,
            );

        const dtoAttachments = Array.isArray(dto.attachments)
            ? dto.attachments
            : [];
        const attachments = [...uploadedAttachments, ...dtoAttachments];

        const normalizedContent = dto.content?.trim() ?? '';

        const repliedMessage = dto.replyToMessageId
            ? await this.messagesCoreService.getReplyParentOrFail(
                  chatId,
                  dto.replyToMessageId,
              )
            : null;

        const forwardedFrom = dto.forwardFromMessageId
            ? await this.messagesCoreService.getForwardSourceOrFail(
                  dto.forwardFromMessageId,
                  sender.id,
              )
            : null;

        return this.saveAndNotifyMessage(
            async (manager) => {
                let message = manager.create(Message, {
                    chat,
                    sender,
                    content: normalizedContent,
                    attachments,
                    type: 'text',
                    isRead: false,
                    isDeleted: false,
                    repliedMessage,
                    forwardedFrom,
                    quotedText: dto.quotedText,
                } as Partial<Message>);

                message = await manager.save(Message, message);

                message.currentContent =
                    await this.messagesCoreService.createMessageVersion(
                        manager,
                        message,
                        normalizedContent,
                        attachments,
                        1,
                    );
                message = await manager.save(Message, message);

                await manager.update(
                    Chat,
                    { id: chat.id },
                    { lastMessage: message },
                );
                await this.messagesCoreService.updateUnreadCounts(
                    manager,
                    chat,
                    sender.id,
                );

                return message;
            },
            chat,
            sender.id,
        );
    }

    async sendVoiceMessage(
        chatId: string,
        sender: User,
        dto: SendVoiceMessageDto,
        file: Express.Multer.File,
    ): Promise<Message> {
        this.messagesCoreService.validateVoiceMessage(file);

        const chat = await this.messagesCoreService.getChatAndEnsureMembership(
            chatId,
            sender.id,
        );

        const voiceKey =
            await this.messagesAttachmentService.processVoiceMessage(file);

        const normalizedContent = dto.content?.trim() ?? '';

        const repliedMessage = dto.replyToMessageId
            ? await this.messagesCoreService.getReplyParentOrFail(
                  chatId,
                  dto.replyToMessageId,
              )
            : null;

        const forwardedFrom = dto.forwardFromMessageId
            ? await this.messagesCoreService.getForwardSourceOrFail(
                  dto.forwardFromMessageId,
                  sender.id,
              )
            : null;

        return this.saveAndNotifyMessage(
            async (manager) => {
                let message = manager.create(Message, {
                    chat,
                    sender,
                    content: normalizedContent,
                    attachments: [],
                    voiceUrl: voiceKey,
                    type: 'voice',
                    isRead: false,
                    isDeleted: false,
                    repliedMessage,
                    forwardedFrom,
                    quotedText: dto.quotedText,
                } as Partial<Message>);

                message = await manager.save(Message, message);

                message.currentContent =
                    await this.messagesCoreService.createMessageVersion(
                        manager,
                        message,
                        normalizedContent,
                        [],
                        1,
                    );
                message = await manager.save(Message, message);

                await manager.update(
                    Chat,
                    { id: chat.id },
                    { lastMessage: message },
                );

                await this.messagesCoreService.updateUnreadCounts(
                    manager,
                    chat,
                    sender.id,
                );

                return message;
            },
            chat,
            sender.id,
        );
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
        const result = await this.messagesCoreService.getMessages(
            chatId,
            pagination,
            userId,
        );

        const messagesWithUrls = await Promise.all(
            result.messages.map((message) =>
                this.messagesAttachmentService.addSignedUrlsToMessage(message),
            ),
        );

        return {
            ...result,
            messages: messagesWithUrls,
        };
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

        const chat = await this.messagesCoreService.getChatAndEnsureMembership(
            chatId,
            editorId,
        );

        const editedMessage = await this.messageRepository.manager.transaction(
            async (manager) => {
                const message = await manager
                    .getRepository(Message)
                    .createQueryBuilder('m')
                    .setLock('pessimistic_write')
                    .where('m.id = :messageId', { messageId })
                    .andWhere('m.isDeleted = false')
                    .andWhere('m.chatId = :chatId', { chatId })
                    .getOne();

                if (!message)
                    throw new NotFoundException(
                        ERROR_MESSAGES.MESSAGE.NOT_FOUND,
                    );

                const author = await manager
                    .getRepository(Message)
                    .createQueryBuilder('m')
                    .leftJoinAndSelect('m.sender', 'sender')
                    .where('m.id = :id', { id: message.id })
                    .getOne();

                if (!author || author.sender.id !== editorId)
                    throw new ForbiddenException(
                        ERROR_MESSAGES.AUTH.NO_PERMISSIONS,
                    );

                const withCurrent = await manager.findOne(Message, {
                    where: { id: message.id },
                    relations: ['currentContent'],
                });

                const prevVersion = withCurrent?.currentContent?.version ?? 0;
                const prevAttachments =
                    withCurrent?.currentContent?.attachments ?? [];
                const prevText =
                    withCurrent?.currentContent?.content ??
                    withCurrent?.content ??
                    '';

                if (prevText === newTextRaw)
                    throw new BadRequestException(
                        ERROR_MESSAGES.MESSAGE.NO_CHANGES,
                    );

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
                    throw new NotFoundException(
                        ERROR_MESSAGES.MESSAGE.RELOAD_FAIL,
                    );
                return full;
            },
        );

        const messageWithUrls =
            await this.messagesAttachmentService.addSignedUrlsToMessage(
                editedMessage,
            );
        this.chatGateway.broadcastMessageEdited(chat.id, messageWithUrls);

        return messageWithUrls;
    }

    async deleteMessage(chatId: string, messageId: string, userId: number) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId, chat: { id: chatId }, isDeleted: false },
            relations: ['sender'],
        });

        if (!message)
            throw new NotFoundException(ERROR_MESSAGES.MESSAGE.NOT_FOUND);
        if (message.sender.id !== userId)
            throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);

        const deletionErrors =
            await this.messagesAttachmentService.deleteMessageAttachments(
                message,
            );

        this.chatGateway.broadcastMessageDeleted(chatId, message);
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
        await this.messagesCoreService.markMessagesAsRead(chatId, userId);
        this.chatGateway.sendReadReceipt(chatId, userId);
    }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '../../storage/services';
import { Message } from '../../database/entities';
import { ERROR_MESSAGES } from '../../common/constants/messages';

@Injectable()
export class MessagesAttachmentService {
    constructor(private readonly storageService: StorageService) {}

    async processVoiceMessage(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException(ERROR_MESSAGES.MESSAGE.FILE_REQUIRED);
        }

        if (!file.mimetype.startsWith('audio/')) {
            throw new BadRequestException(
                ERROR_MESSAGES.MESSAGE.VOICE_REQUIRED,
            );
        }

        return await this.storageService.uploadFile(file);
    }

    async processMessageAttachments(files?: Express.Multer.File[]): Promise<
        Array<{
            type: 'image' | 'video' | 'file';
            url: string;
            name: string;
            size: number;
        }>
    > {
        const uploadedAttachments: Array<{
            type: 'image' | 'video' | 'file';
            url: string;
            name: string;
            size: number;
        }> = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const fileKey = await this.storageService.uploadFile(file);

                let fileType: 'image' | 'video' | 'file' = 'file';
                if (file.mimetype.startsWith('image/')) {
                    fileType = 'image';
                } else if (file.mimetype.startsWith('video/')) {
                    fileType = 'video';
                }

                uploadedAttachments.push({
                    type: fileType,
                    url: fileKey,
                    name: file.originalname,
                    size: file.size,
                });
            }
        }

        return uploadedAttachments;
    }

    async addSignedUrlsToMessage(message: Message): Promise<Message> {
        if (message.attachments && message.attachments.length > 0) {
            message.attachments = await Promise.all(
                message.attachments.map(async (attachment) => ({
                    ...attachment,
                    url: await this.storageService.getFileUrl(attachment.url),
                })),
            );
        }

        if (message.voiceUrl) {
            message.voiceUrl = await this.storageService.getFileUrl(
                message.voiceUrl,
            );
        }

        if (
            message.currentContent?.attachments &&
            message.currentContent.attachments.length > 0
        ) {
            message.currentContent.attachments = await Promise.all(
                message.currentContent.attachments.map(async (attachment) => ({
                    ...attachment,
                    url: await this.storageService.getFileUrl(attachment.url),
                })),
            );
        }

        if (
            message.forwardedFrom?.currentContent?.attachments &&
            message.forwardedFrom.currentContent.attachments.length > 0
        ) {
            message.forwardedFrom.currentContent.attachments =
                await Promise.all(
                    message.forwardedFrom.currentContent.attachments.map(
                        async (attachment) => ({
                            ...attachment,
                            url: await this.storageService.getFileUrl(
                                attachment.url,
                            ),
                        }),
                    ),
                );
        }

        if (message.forwardedFrom?.voiceUrl) {
            message.forwardedFrom.voiceUrl =
                await this.storageService.getFileUrl(
                    message.forwardedFrom.voiceUrl,
                );
        }

        if (
            message.repliedMessage?.currentContent?.attachments &&
            message.repliedMessage.currentContent.attachments.length > 0
        ) {
            message.repliedMessage.currentContent.attachments =
                await Promise.all(
                    message.repliedMessage.currentContent.attachments.map(
                        async (attachment) => ({
                            ...attachment,
                            url: await this.storageService.getFileUrl(
                                attachment.url,
                            ),
                        }),
                    ),
                );
        }

        if (message.repliedMessage?.voiceUrl) {
            message.repliedMessage.voiceUrl =
                await this.storageService.getFileUrl(
                    message.repliedMessage.voiceUrl,
                );
        }

        return message;
    }

    async deleteMessageAttachments(message: Message): Promise<string[]> {
        const deletionErrors: string[] = [];

        if (message.attachments && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
                try {
                    await this.storageService.deleteFile(attachment.url);
                } catch (error) {
                    const errorMsg = `Failed to delete attachment: ${attachment.name || attachment.url}`;
                    deletionErrors.push(errorMsg);
                    console.error(errorMsg, error);
                }
            }
        }

        if (message.voiceUrl) {
            try {
                await this.storageService.deleteFile(message.voiceUrl);
            } catch (error) {
                const errorMsg = `Failed to delete voice message: ${message.voiceUrl}`;
                deletionErrors.push(errorMsg);
                console.error(errorMsg, error);
            }
        }

        return deletionErrors;
    }
}

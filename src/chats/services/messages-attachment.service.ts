import { BadRequestException, Injectable } from '@nestjs/common';
import { FileUrlsService, StorageService } from '../../storage/services';
import { Message } from '../../database/entities';
import { ERROR_MESSAGES } from '../../common/constants/messages';
import { Asset } from '../../database/interfaces';

@Injectable()
export class MessagesAttachmentService {
    constructor(
        private readonly storageService: StorageService,
        private readonly fileUrlsService: FileUrlsService,
    ) {}

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

    async processMessageAttachments(files?: Express.Multer.File[]): Promise<{
        attachments: Array<Asset>;
        errors: Array<{
            fileName: string;
            error: string;
        }>;
    }> {
        const uploadedAttachments: Array<Asset> = [];
        const errors: Array<{
            fileName: string;
            error: string;
        }> = [];

        if (files && files.length > 0) {
            for (const file of files) {
                try {
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
                } catch (error) {
                    errors.push({
                        fileName: file.originalname,
                        error: error.message || 'Unknown upload error',
                    });
                }
            }
        }

        return {
            attachments: uploadedAttachments,
            errors,
        };
    }

    async addSignedUrlsToMessage(message: Message): Promise<Message> {
        return this.fileUrlsService.addSignedUrlsDeep(message);
    }

    async deleteMessageAttachments(message: Message): Promise<string[]> {
        const deletionErrors: string[] = [];

        if (message.attachments && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
                try {
                    await this.storageService.deleteFile(attachment.url);
                } catch {
                    deletionErrors.push(
                        `Failed to delete attachment: ${attachment.name || attachment.url}`,
                    );
                }
            }
        }

        if (message.voiceUrl) {
            try {
                await this.storageService.deleteFile(message.voiceUrl);
            } catch {
                deletionErrors.push(
                    `Failed to delete voice message: ${message.voiceUrl}`,
                );
            }
        }

        return deletionErrors;
    }
}

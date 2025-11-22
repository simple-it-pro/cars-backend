import {
    BadRequestException,
    Inject,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

import { ERROR_MESSAGES } from '../../common/constants/messages';
import { s3 } from '../../config';

@Injectable()
export class StorageService {
    private readonly s3Client: S3Client | null = null;
    private readonly bucketName: string;
    private readonly isConfigured: boolean;

    constructor(@Inject(s3.KEY) private s3Config: ConfigType<typeof s3>) {
        this.isConfigured = !!(
            s3Config.accessKeyId &&
            s3Config.secretAccessKey &&
            s3Config.region &&
            s3Config.endpoint &&
            s3Config.bucketName
        );

        if (this.isConfigured) {
            this.s3Client = new S3Client({
                credentials: {
                    accessKeyId: s3Config.accessKeyId,
                    secretAccessKey: s3Config.secretAccessKey,
                },
                region: s3Config.region,
                endpoint: s3Config.endpoint,
            });
        }

        this.bucketName = s3Config.bucketName;
    }

    private ensureConfigured(): void {
        if (!this.isConfigured || !this.s3Client) {
            throw new InternalServerErrorException(
                'S3 storage is not configured',
            );
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        this.ensureConfigured();

        if (!file) {
            throw new BadRequestException(ERROR_MESSAGES.STORAGE.NO_FILE);
        }

        try {
            const key = this.generateKey(file.originalname);
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            await this.s3Client!.send(command);
            return key;
        } catch (error) {
            console.error('S3 upload error:', error);

            throw new InternalServerErrorException(
                ERROR_MESSAGES.STORAGE.UPLOAD_FAILED,
            );
        }
    }

    async getFileUrl(key: string): Promise<string> {
        this.ensureConfigured();

        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return getSignedUrl(this.s3Client!, command, { expiresIn: 3600 });
    }

    async deleteFile(key: string): Promise<void> {
        this.ensureConfigured();

        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client!.send(command);
    }

    private generateKey(originalName: string): string {
        const extension = originalName.split('.').pop();
        return `${randomUUID()}.${extension}`;
    }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { ERROR_MESSAGES } from '../common/constants/messages';

@Injectable()
export class StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY');
    const bucketName = this.configService.get<string>('S3_BUCKET_NAME');
    const endpoint = this.configService.get<string>('S3_API_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION');

    if (
      !accessKeyId ||
      !secretAccessKey ||
      !bucketName ||
      !endpoint ||
      !region
    ) {
      throw new Error(ERROR_MESSAGES.STORAGE.MISSING_ENV);
    }

    this.s3Client = new S3Client({
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
      region,
      endpoint,
    });

    this.bucketName = bucketName;
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException(ERROR_MESSAGES.STORAGE.NO_FILE);
    }

    const key = this.generateKey(file.originalname);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return key;
  }

  async getFileUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  private generateKey(originalName: string): string {
    const extension = originalName.split('.').pop();
    return `${randomUUID()}.${extension}`;
  }
}

import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const key = this.storageService.generateKey(file.originalname);
      await this.storageService.uploadFile(file.buffer, key, file.mimetype);

      return {
        key,
        originalName: file.originalname,
        size: file.size,
        contentType: file.mimetype,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to upload file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':key')
  async getFileUrl(@Param('key') key: string) {
    try {
      const url = await this.storageService.getFileUrl(key);
      return { url };
    } catch (error) {
      throw new HttpException(
        `Failed to get file URL: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string) {
    try {
      await this.storageService.deleteFile(key);
      return { message: 'File deleted successfully' };
    } catch (error) {
      throw new HttpException(
        `Failed to delete file: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

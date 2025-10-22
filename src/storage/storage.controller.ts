import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadFileResponseDto } from './dto/update-file-response.dto';
import { FileUrlResponseDto } from './dto/file-url-response.dto';
import { DeleteFileResponseDto } from './dto/delete-file-response.dto';
import { SUCCESS_MESSAGES } from '../common/constants/messages';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}
  @Put('upload')
  @ApiOperation({
    summary: 'Загрузить файл',
    description:
      'Загружает файл в S3-совместимое хранилище и возвращает метаданные',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файл для загрузки',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Файл успешно загружен',
    type: UploadFileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Файл не предоставлен',
  })
  @ApiResponse({
    status: 500,
    description: 'Ошибка сервера при загрузке файла',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = await this.storageService.uploadFile(file);

    return {
      key,
      originalName: file.originalname,
      size: file.size,
      contentType: file.mimetype,
    };
  }

  @Get(':key')
  @ApiOperation({
    summary: 'Получить URL файла',
    description:
      'Генерирует signed URL для доступа к файлу (действителен 1 час)',
  })
  @ApiParam({
    name: 'key',
    description: 'Уникальный ключ файла в хранилище',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'URL успешно сгенерирован',
    type: FileUrlResponseDto,
  })
  async getFileUrl(@Param('key') key: string) {
    const url = await this.storageService.getFileUrl(key);
    return { url };
  }

  @Delete(':key')
  @ApiOperation({
    summary: 'Удалить файл',
    description: 'Удаляет файл из хранилища по ключу',
  })
  @ApiParam({
    name: 'key',
    description: 'Уникальный ключ файла в хранилище',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Файл успешно удален',
    type: DeleteFileResponseDto,
  })
  async deleteFile(@Param('key') key: string) {
    await this.storageService.deleteFile(key);
    return { message: SUCCESS_MESSAGES.STORAGE.DELETED_SUCCESS };
  }
}

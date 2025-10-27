import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUrl,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AttachmentDto {
  @ApiProperty({
    example: 'image',
    description: 'Тип вложения',
    enum: ['image', 'video', 'file', 'voice'],
  })
  @IsEnum(['image', 'video', 'file', 'voice'])
  type: 'image' | 'video' | 'file' | 'voice';

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL вложения',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: 'photo.jpg',
    description: 'Название файла',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1024000,
    description: 'Размер файла в байтах',
  })
  @IsNumber()
  size: number;
}

export class SendMessageDto {
  @ApiProperty({
    example: 'Привет! Как дела?',
    description: 'Текст сообщения',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    type: [AttachmentDto],
    description: 'Вложения к сообщению',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsUrl({}, { message: 'Invalid voice URL' })
  voiceUrl?: string;

  @ApiProperty({
    required: false,
    description: 'ID исходного сообщения для ответа',
    example: '9c9a6b7c-1234-5678-9abc-def012345678',
  })
  @IsOptional()
  @IsUUID()
  replyToMessageId?: string;

  @ApiProperty({
    required: false,
    description: 'ID исходного сообщения для пересылки',
    example: '9c9a6b7c-1234-5678-9abc-def012345678',
  })
  @IsOptional()
  @IsUUID()
  forwardFromMessageId?: string;

  @ApiProperty({
    required: false,
    description: 'Текст цитируемой части сообщения',
    example: 'Это цитата из сообщения',
  })
  @IsOptional()
  @IsString()
  quotedText?: string;
}

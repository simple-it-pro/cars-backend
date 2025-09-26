import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class AttachmentDto {
  @ApiProperty({
    example: 'image',
    description: 'Тип вложения',
    enum: ['image', 'video', 'file'],
  })
  @IsEnum(['image', 'video', 'file'])
  type: 'image' | 'video' | 'file';

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
  @IsNotEmpty()
  content: string;

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
}

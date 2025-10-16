import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsEnum } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID чата' })
  @IsString()
  chatId: string;

  @ApiProperty({ example: 1, description: 'ID отправителя' })
  @IsNumber()
  senderId: number;

  @ApiProperty({ example: 'Привет! Как дела?' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'text', enum: ['text', 'voice'] })
  @IsEnum(['text', 'voice'])
  @IsOptional()
  type?: 'text' | 'voice';

  @ApiProperty({
    example: [],
    required: false,
    description: 'Вложения к сообщению'
  })
  @IsArray()
  @IsOptional()
  attachments?: Array<{
    type: 'image' | 'video' | 'file' | 'voice';
    url: string;
    name: string;
    size: number;
  }>;
}

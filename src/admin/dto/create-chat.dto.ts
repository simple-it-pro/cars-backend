import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @ApiProperty({
    example: 'private',
    description: 'Тип чата',
    enum: ['private', 'group'],
    default: 'private',
  })
  @IsOptional()
  @IsEnum(['private', 'group'])
  type?: 'private' | 'group';

  @ApiProperty({
    example: 'Мой групповой чат',
    description: 'Название чата (для групповых)',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Описание группового чата',
    description: 'Описание чата (для групповых)',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: [1, 2],
    description: 'ID участников чата',
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  userIds: number[];

  @ApiProperty({
    example: 1,
    description: 'ID создателя чата',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  createdById?: number;
}

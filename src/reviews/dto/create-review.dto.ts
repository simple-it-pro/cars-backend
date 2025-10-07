import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class ImageDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL изображения',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    example: 'photo.jpg',
    description: 'Название изображения',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1024000,
    description: 'Размер изображения в байтах',
  })
  @IsNumber()
  size: number;
}

export class CreateReviewDto {
  @ApiProperty({
    example: 'Всё быстро и чётко',
    description: 'Текст отзыва',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: 1,
    description: 'ID пользователя, которому оставляют отзыв',
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: 1,
    description: 'ID автора отзыва',
  })
  @IsNumber()
  @IsNotEmpty()
  authorId: number;

  @ApiProperty({
    example: 5,
    description: 'Оценка',
  })
  @IsNumber()
  @IsNotEmpty()
  rank: number;

  @ApiProperty({
    type: [ImageDto],
    description: 'Вложения к сообщению',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  images?: ImageDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 'Всё круто и чётко', description: 'Текст отзыва' })
  @IsString()
  content: string;

  @ApiProperty({ example: 5, description: 'Оценка от 1 до 5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rank: number;

  @ApiProperty({
    example: [
      {
        url: 'https://example.com/image.jpg',
        name: 'photo.jpg',
        size: 1024000,
      },
    ],
    description: 'Изображения (максимум 5)',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(5)
  @IsOptional()
  images?: Array<{
    url: string;
    name: string;
    size: number;
  }>;

  @ApiProperty({ example: 1, description: 'ID автора отзыва' })
  @IsNumber()
  authorId: number;

  @ApiProperty({ example: 2, description: 'ID пользователя, которому оставили отзыв' })
  @IsNumber()
  userId: number;

  @ApiProperty({
    example: false,
    description: 'Верифицирован ли отзыв',
    required: false,
  })
  @IsOptional()
  isVerified?: boolean;
}

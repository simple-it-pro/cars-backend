import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiProperty({
    example: 'Спасибо за хороший отзыв',
    description: 'Ответ на отзыв',
    required: false,
  })
  @IsOptional()
  @IsString()
  answer?: string;
}

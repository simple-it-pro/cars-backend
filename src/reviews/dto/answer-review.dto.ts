import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { reviewLength } from '../../common/constants/reviews';

export class AnswerReviewDto {
  @ApiProperty({
    example: 'Спасибо за ваш отзыв!',
    description: 'Ответ на отзыв',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(reviewLength, {
    message: `Ответ не должен превышать ${reviewLength} символов`,
  })
  answer: string;
}

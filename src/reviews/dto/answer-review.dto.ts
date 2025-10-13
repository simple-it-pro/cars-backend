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
    message: 'Ответ не должен превышать 200 символов',
  })
  answer: string;

  @ApiProperty({
    example: 1,
    description: 'id польователя',
  })
  @IsInt()
  @IsNotEmpty()
  userId: number;
}

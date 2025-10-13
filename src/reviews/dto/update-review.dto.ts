import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {reviewLength} from "../../common/constants/reviews";

export class UpdateReviewDto {
  @ApiProperty({
    example: 'Спасибо за ваш отзыв!',
    description: 'Ответ на отзыв',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(reviewLength, { message: 'Ответ не должен превышать 200 символов' })
  answer: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsString,
    Max,
    MaxLength,
    Min,
} from 'class-validator';
import { reviewLength } from '../../common/constants/reviews';

export class CreateReviewDto {
    @ApiProperty({
        example: 'Всё быстро и чётко',
        description: 'Текст отзыва',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(reviewLength)
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
    @IsInt()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rank: number;
}

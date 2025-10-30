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
import { Type } from 'class-transformer';

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
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    userId: number;

    @ApiProperty({
        example: 5,
        description: 'Оценка',
    })
    @IsInt()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    @Type(() => Number)
    rank: number;
}

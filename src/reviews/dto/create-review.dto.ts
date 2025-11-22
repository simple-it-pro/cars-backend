import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsString,
    IsUUID,
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
    @IsUUID()
    userId: string;

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

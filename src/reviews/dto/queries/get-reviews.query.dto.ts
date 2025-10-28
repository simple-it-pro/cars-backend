import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationQueryDto } from './pagination.query.dto';

export class GetReviewsQueryDto extends PaginationQueryDto {
    @ApiProperty({
        description: 'ID пользователя для фильтрации отзывов',
        required: false,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    userId?: number;
}

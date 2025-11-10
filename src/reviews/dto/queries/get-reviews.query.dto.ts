import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from './pagination.query.dto';

export class GetReviewsQueryDto extends PaginationQueryDto {
    @ApiProperty({
        description: 'ID пользователя для фильтрации отзывов',
        required: false,
    })
    @IsUUID()
    @IsOptional()
    userId?: string;
}

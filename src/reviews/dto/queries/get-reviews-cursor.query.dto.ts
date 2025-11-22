import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { CursorOptionsDto } from '../../../shared/pagination/cursor';

export class GetReviewsCursorQueryDto extends CursorOptionsDto {
    @ApiPropertyOptional({
        description: 'ID пользователя, чьи отзывы получаем',
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ description: 'ID автора отзывов' })
    @IsOptional()
    @IsString()
    authorId?: string;

    @ApiPropertyOptional({ description: 'Фильтр по верификации отзывов' })
    @IsOptional()
    @IsBoolean()
    isVerified?: boolean;
}

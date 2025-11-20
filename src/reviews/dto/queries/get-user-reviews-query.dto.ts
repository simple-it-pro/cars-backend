import { CursorOptionsDto } from '../../../shared/pagination/cursor';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetUserReviewsCursorQueryDto extends CursorOptionsDto {
    @ApiPropertyOptional({ description: 'Поиск по содержимому отзыва' })
    @IsOptional()
    @IsString()
    search?: string;
}

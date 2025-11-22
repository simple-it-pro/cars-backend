import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetUsersFilterDto {
    @ApiPropertyOptional({
        example: 'Иван',
        description: 'Фильтр по имени пользователя',
    })
    @IsOptional()
    @IsString()
    name?: string;
}

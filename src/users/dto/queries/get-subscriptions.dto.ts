import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetSubscriptionsQueryDto {
    @ApiPropertyOptional({
        description: 'Поиск по имени или никнейму пользователя',
        example: 'John',
    })
    @IsString()
    @IsOptional()
    readonly search?: string;
}

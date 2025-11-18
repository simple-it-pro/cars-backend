import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetPostsQueryDto {
    @ApiPropertyOptional({
        description: 'Поля для включения в выдачу',
        isArray: true,
        enum: ['files', 'hashtags'],
    })
    @IsIn(['files', 'hashtags'], { each: true })
    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return [];
        return Array.isArray(value) ? [...new Set(value)] : [value];
    })
    includes?: ('files' | 'hashtags')[];

    @ApiPropertyOptional({
        description: 'Хэштеги для фильтрации',
        isArray: true,
        type: String,
    })
    @IsString({ each: true })
    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return [];
        return Array.isArray(value) ? [...new Set(value)] : [value];
    })
    hashtags?: string[];

    @ApiPropertyOptional({
        description: 'ID пользователя',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsOptional()
    userId?: string;
}

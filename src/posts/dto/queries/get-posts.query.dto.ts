import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional } from 'class-validator';
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
}

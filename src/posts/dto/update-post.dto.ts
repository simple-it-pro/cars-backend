import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    Length,
    IsArray,
    IsUUID,
    ArrayMinSize,
    ArrayMaxSize,
} from 'class-validator';

export class UpdatePostDto {
    @ApiPropertyOptional({
        description: 'Заголовок поста',
        example: 'Заголовок поста',
    })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiPropertyOptional({
        description: 'Текст поста',
        example: 'Текст поста',
    })
    @IsString()
    @Length(1, 1000, { message: 'Описание должно быть от 1 до 1000 символов' })
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({
        description: 'ID изображений',
        example: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
        ],
    })
    @IsArray()
    @IsUUID('all', { each: true })
    @ArrayMinSize(1, { message: 'Нужно загрузить хотя бы одно изображение' })
    @ArrayMaxSize(10, { message: 'Нельзя загрузить более 10 изображений' })
    @IsOptional()
    imagesIds?: string[];
}

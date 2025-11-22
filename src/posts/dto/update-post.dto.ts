import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDto {
    @ApiProperty({
        example: 'Обновленный текст поста',
        description: 'Текст поста',
        minLength: 1,
        maxLength: 2000,
        required: false,
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Текст поста не может быть пустым' })
    @MinLength(1, { message: 'Текст поста должен содержать минимум 1 символ' })
    @MaxLength(2000, { message: 'Текст поста не может превышать 2000 символов' })
    content?: string;
}

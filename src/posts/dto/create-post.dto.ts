import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
    @ApiProperty({
        example: 'Это мой новый пост о машинах!',
        description: 'Текст поста',
        minLength: 1,
        maxLength: 2000,
    })
    @IsString()
    @IsNotEmpty({ message: 'Текст поста не может быть пустым' })
    @MinLength(1, { message: 'Текст поста должен содержать минимум 1 символ' })
    @MaxLength(2000, { message: 'Текст поста не может превышать 2000 символов' })
    content: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectPostDto {
    @ApiProperty({
        example: 'Пост содержит недопустимый контент',
        description: 'Причина отклонения поста',
        maxLength: 500,
    })
    @IsString()
    @IsNotEmpty({ message: 'Укажите причину отклонения' })
    @MaxLength(500, { message: 'Причина отклонения не может превышать 500 символов' })
    reason: string;
}

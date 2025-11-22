import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditMessageDto {
    @ApiProperty({
        example: 'Привет! Как дела?',
        description: 'Текст сообщения',
    })
    @IsString()
    @IsNotEmpty()
    content: string;
}

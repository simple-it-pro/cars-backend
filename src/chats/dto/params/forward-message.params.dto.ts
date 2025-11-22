import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ForwardMessageParamsDto {
    @ApiProperty({
        description: 'ID чата-получателя',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    })
    @IsUUID()
    chatId: string;

    @ApiProperty({
        description: 'ID исходного сообщения (источник пересылки)',
        example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012',
    })
    @IsUUID()
    messageId: string;
}

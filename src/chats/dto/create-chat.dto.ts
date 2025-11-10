import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
    @ApiProperty({
        example: 123,
        description: 'ID пользователя для создания чата',
    })
    @IsUUID()
    partnerId: string;
}

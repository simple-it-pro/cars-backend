import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatIdsDto {
    @ApiProperty({
        description: 'Array of chat IDs',
        example: ['chat-uuid-1', 'chat-uuid-2'],
    })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    chatIds: string[];
}

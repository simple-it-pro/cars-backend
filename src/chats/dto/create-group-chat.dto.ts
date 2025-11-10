import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from 'class-validator';

export class CreateGroupChatDto {
    @ApiProperty({
        example: 'Мой групповой чат',
        description: 'Название группового чата',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: [
            '2421f3a1-2ea9-418c-a1f3-a12ea9618c34',
            '13e290e3-b0b3-45d5-a290-e3b0b3a5d587',
            '48917ab9-5908-42e7-917a-b9590822e785',
        ],
        description: 'ID пользователей для добавления в чат',
    })
    @IsArray()
    @IsUUID(undefined, { each: true })
    userIds: string[];

    @ApiProperty({
        example: 'Описание нашего чата',
        description: 'Описание группового чата',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}

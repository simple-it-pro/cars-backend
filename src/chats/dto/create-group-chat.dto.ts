import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
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
        example: [2, 3, 4],
        description: 'ID пользователей для добавления в чат',
    })
    @IsArray()
    @IsNumber({}, { each: true })
    userIds: number[];

    @ApiProperty({
        example: 'Описание нашего чата',
        description: 'Описание группового чата',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}

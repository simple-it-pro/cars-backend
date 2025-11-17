import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';

export class SendVideoMessageDto {
    @ApiProperty({
        required: false,
        description: 'Подпись к видео сообщению',
        example: 'Видео заметка',
    })
    @IsOptional()
    @IsString()
    content?: string;

    @ApiProperty({
        required: false,
        description: 'ID исходного сообщения для ответа',
        example: '9c9a6b7c-1234-5678-9abc-def012345678',
    })
    @IsOptional()
    @IsUUID()
    replyToMessageId?: string;

    @ApiProperty({
        required: false,
        description: 'ID исходного сообщения для пересылки',
        example: '9c9a6b7c-1234-5678-9abc-def012345678',
    })
    @IsOptional()
    @IsUUID()
    forwardFromMessageId?: string;

    @ApiProperty({
        required: false,
        description: 'Текст цитируемой части сообщения',
        example: 'Это цитата из сообщения',
    })
    @IsOptional()
    @IsString()
    quotedText?: string;

    @ApiProperty({
        required: false,
        description:
            'Альтернатива загрузке файла: уже загруженный ключ/URL видео',
        example: 's3://bucket/key-or-signed-url',
    })
    @IsOptional()
    @IsUrl({}, { message: 'Invalid video URL' })
    videoUrl?: string;
}

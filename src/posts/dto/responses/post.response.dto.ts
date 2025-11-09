import { ApiProperty } from '@nestjs/swagger';

import { PostStatusEnum } from '../../../database/enums';
import { FileEntity } from '../../../database/entities';

export class PostResponseDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор поста',
    })
    id: string;

    @ApiProperty({
        example: 'Заголовок поста',
        description: 'Заголовок поста',
    })
    title: string;

    @ApiProperty({
        example: 'Описание поста',
        description: 'Описание поста',
    })
    description: string;

    @ApiProperty({
        example: PostStatusEnum.DRAFT,
        enum: PostStatusEnum,
        description: 'Статус поста',
    })
    status: PostStatusEnum;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата создания поста',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата обновления поста',
    })
    updatedAt: Date;

    @ApiProperty({
        type: () => FileEntity,
        isArray: true,
        description: 'Упорядоченные файлы поста',
    })
    files: FileEntity[];
}

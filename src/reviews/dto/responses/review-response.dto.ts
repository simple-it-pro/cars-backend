import { ApiProperty } from '@nestjs/swagger';
import { Image } from '../../../database/interfaces';
import { UserResponseDto } from '../../../users/dto/responses';

export class ReviewResponseDto {
    @ApiProperty({ description: 'ID отзыва' })
    id: string;

    @ApiProperty({ description: 'Содержимое отзыва' })
    content: string;

    @ApiProperty({ description: 'Рейтинг' })
    rank: number;

    @ApiProperty({
        description: 'Изображения',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                url: { type: 'string' },
                name: { type: 'string' },
                size: { type: 'number' },
            },
        },
    })
    images: Image[];

    @ApiProperty({ description: 'Ответ на отзыв', required: false })
    answer?: string;

    @ApiProperty({ description: 'Дата ответа', required: false })
    answeredAt?: Date;

    @ApiProperty({ description: 'Верифицирован ли отзыв' })
    isVerified: boolean;

    @ApiProperty({ description: 'Дата создания' })
    createdAt: Date;

    @ApiProperty({ description: 'Дата обновления' })
    updatedAt: Date;

    @ApiProperty({
        description: 'Пользователь, которому оставлен отзыв',
        type: UserResponseDto,
    })
    user: UserResponseDto;

    @ApiProperty({ description: 'Автор отзыва', type: UserResponseDto })
    author: UserResponseDto;
}

import { ApiBodyOptions } from '@nestjs/swagger';

export const REVIEWS_BODIES = {
    CREATE_REVIEW: {
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: 'Текст отзыва',
                    example: 'Отличный автомобиль!',
                },
                userId: {
                    type: 'string',
                    description: 'ID пользователя, которому оставляют отзыв',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                    format: 'uuid',
                },
                rank: {
                    type: 'number',
                    description: 'Оценка',
                    example: '5',
                },
                images: {
                    type: 'array',
                    description: 'Изображения',
                    items: { type: 'string', format: 'binary' },
                },
            },
        },
    } as ApiBodyOptions,
} as const;

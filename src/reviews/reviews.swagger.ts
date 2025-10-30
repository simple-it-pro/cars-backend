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
                    type: 'number',
                    description: 'ID пользователя, которому оставляют отзыв',
                    example: '1',
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

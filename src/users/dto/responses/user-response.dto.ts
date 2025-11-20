import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/types';
import { Image } from '../../../database/interfaces';

export class UserResponseDto {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор',
    })
    id: string;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    createdAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    updatedAt: Date;

    @ApiProperty({
        example: UserRole.COMMON,
        enum: UserRole,
        description: 'Роль пользователя',
    })
    role: UserRole;

    @ApiProperty({
        example: 'user',
    })
    login: string;

    @ApiProperty({
        example: 'John',
    })
    nickname: string;

    @ApiProperty({
        example: 'John Doe',
    })
    name: string;

    @ApiProperty({
        example: '2000-09-01T08:57:59.589Z',
    })
    birthdate: Date;

    @ApiProperty({
        example: 'example@example.com',
    })
    email: string;

    @ApiProperty({
        example: '+79991234567',
        description: 'Номер телефона',
    })
    phone: string;

    @ApiProperty({
        example: 'Москва',
    })
    city: string;

    @ApiProperty({
        example:
            'Я новичок в этом деле, но уже имею опыт и хорошие авто в гараже',
    })
    about: string;

    @ApiProperty({
        example: {
            url: 'https://example.com/image.jpg',
            name: 'photo.jpg',
            size: 1024000,
        },
    })
    image: Image;

    @ApiProperty({
        example: 5,
    })
    rating: number;

    @ApiProperty({
        example: false,
    })
    isDeactivated: boolean;
}

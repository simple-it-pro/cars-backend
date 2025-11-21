import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class SubscriptionUserDto {
    @Expose()
    @ApiProperty({ example: 'c20ad4d7-6fe9-4759-8a27-a0c99bff6710' })
    id: string;

    @Expose()
    @ApiProperty({ example: 'stitch', nullable: true })
    nickname: string | null;

    @Expose()
    @ApiProperty({ example: 'Тест Тестов', nullable: true })
    name: string | null;

    @Expose()
    @ApiProperty({ example: 'Москва', nullable: true })
    city: string | null;

    @Expose()
    @ApiProperty({ example: 'О себе...', nullable: true })
    about: string | null;

    @Expose()
    @ApiProperty({
        example: {
            url: 'https://signed-url.com/avatar.webp',
            name: 'avatar.webp',
            size: 63958,
        },
        nullable: true,
    })
    image: {
        url: string;
        name: string;
        size: number;
    } | null;

    @Expose()
    @ApiProperty({ example: 4.5 })
    rating: number;

    @Expose()
    @ApiProperty({ example: '2025-11-11T13:49:10.255Z' })
    createdAt: Date;

    @Expose()
    @ApiProperty({ example: false })
    isSubscribed: boolean;

    @Expose()
    @ApiProperty({ example: false })
    isBlocked: boolean;
}

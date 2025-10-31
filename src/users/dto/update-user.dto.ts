import {
    IsEmail,
    IsISO8601,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({
        example: 'Nickname',
        description: 'Никнейм пользователя',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(30)
    nickname?: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'Имя пользователя',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(255)
    name?: string;

    @ApiProperty({
        example: '2000-09-01T08:57:59.589Z',
        required: false,
    })
    @IsISO8601()
    @IsOptional()
    birthdate?: string;

    @ApiProperty({
        example: 'example@example.com',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    @MinLength(3)
    @MaxLength(255)
    email?: string;

    @ApiProperty({
        example: '+79991234567',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(10)
    phone?: string;

    @ApiProperty({
        example: 'Москва',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(3)
    city?: string;

    @ApiProperty({
        example:
            'Я новичок в этом деле, но уже имею опыт и хорошие авто в гараже',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    about?: string;
}

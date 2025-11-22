import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEnum,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    IsEmail,
    IsBoolean,
} from 'class-validator';
import { UserRole } from '../../common/types';

export class AdminUpdateUserDto {
    @ApiPropertyOptional({
        example: '+79991234567',
        description: 'Номер телефона',
    })
    @IsOptional()
    @IsString()
    @Matches(/^\+7\d{10}$/, {
        message: 'Телефон должен быть в формате +7XXXXXXXXXX',
    })
    phone?: string;

    @ApiPropertyOptional({
        example: 'Иван Иванов',
        description: 'Имя пользователя',
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({
        example: 'ivan',
        description: 'Никнейм',
    })
    @IsOptional()
    @IsString()
    @MaxLength(30)
    nickname?: string;

    @ApiPropertyOptional({
        example: 'user@example.com',
        description: 'Email',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        example: 'Москва',
        description: 'Город',
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        enum: UserRole,
        example: UserRole.COMMON,
        description: 'Роль пользователя',
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({
        example: false,
        description: 'Деактивирован ли пользователь',
    })
    @IsOptional()
    @IsBoolean()
    isDeactivated?: boolean;
}

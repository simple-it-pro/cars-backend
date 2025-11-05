import { NotificationType } from '../../common/types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNotificationDto {
    @ApiProperty({ example: 'like' })
    @IsEnum(NotificationType)
    type: NotificationType;

    @ApiProperty({ example: 'like' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    title: string;

    @ApiProperty({ example: 'like' })
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    description: string;
}

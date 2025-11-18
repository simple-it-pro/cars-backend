import { ApiProperty } from '@nestjs/swagger';
import {
    IsDate,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceRecordDto {
    @ApiProperty({
        description: 'Дата обслуживания',
        example: '2025-11-13T10:00:00.000Z',
    })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    serviceDate: Date;

    @ApiProperty({
        description: 'Пробег, км',
        example: 48000,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    mileageKm?: number;

    @ApiProperty({
        description: 'Описание работ',
        example: 'ТО: замена масла, фильтров',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Сервис / дилерский центр',
        example: 'Официальный дилер Toyota',
        required: false,
    })
    @IsOptional()
    @IsString()
    serviceCenter?: string;

    @ApiProperty({
        description: 'Стоимость обслуживания',
        example: 15000,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    amount?: number;

    @ApiProperty({
        description: 'Рекомендованная дата следующего обслуживания',
        example: '2026-05-13T10:00:00.000Z',
        required: false,
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    nextServiceDate?: Date;
}

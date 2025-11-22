import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseTypes } from '../../database/enums/cars';

export class CreateCarExpenseDto {
    @ApiProperty({
        enum: ExpenseTypes,
        description: 'Тип расхода',
        example: ExpenseTypes.FUEL,
    })
    @IsEnum(ExpenseTypes)
    type: ExpenseTypes;

    @ApiProperty({
        description: 'Сумма расхода',
        example: 2500,
    })
    @IsNumber()
    @Type(() => Number)
    amount: number;

    @ApiProperty({
        description: 'Дата расхода',
        example: '2025-11-13T10:00:00.000Z',
    })
    @IsNotEmpty()
    @Type(() => Date)
    date: Date;

    @ApiProperty({
        description: 'Пробег на момент расхода, км',
        example: 45200,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    mileageKm?: number;

    @ApiProperty({
        description: 'Комментарий / описание',
        example: 'Заправка 95-го',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
    Bodyworks,
    FuelTypes,
    TransmissionTypes,
} from '../../database/enums/cars';

export class UpdateCarDto {
    @ApiProperty({ example: 'Toyota' })
    @IsString()
    make: string;

    @ApiProperty({ example: 'Camry' })
    @IsString()
    model: string;

    @ApiProperty({ example: 2020 })
    @IsNumber()
    year: number;

    @ApiProperty({ enum: Bodyworks, example: Bodyworks.SEDAN })
    @IsEnum(Bodyworks)
    bodywork: Bodyworks;

    @ApiProperty({ enum: FuelTypes, example: FuelTypes.PETROL })
    @IsEnum(FuelTypes)
    fuelType: FuelTypes;

    @ApiProperty({ enum: TransmissionTypes, example: TransmissionTypes.AT })
    @IsEnum(TransmissionTypes)
    transmission: TransmissionTypes;

    @ApiProperty({ example: 45000 })
    @IsNumber()
    mileageKm: number;

    @ApiProperty({ example: 'White', required: false })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiProperty({ example: 181, required: false })
    @IsNumber()
    @IsOptional()
    powerHp?: number;

    @ApiProperty({ example: 2.5, required: false })
    @IsNumber()
    @IsOptional()
    engineVolumeL?: number;

    @ApiProperty({ example: 7.8, required: false })
    @IsNumber()
    @IsOptional()
    fuelConsumption?: number;

    @ApiProperty({ example: 1250000, required: false })
    @IsNumber()
    @IsOptional()
    price?: number;
}

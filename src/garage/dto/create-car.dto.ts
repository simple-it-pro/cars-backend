import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional } from 'class-validator';
import { UpdateCarDto } from './update-car.dto';

export class CreateCarDto extends UpdateCarDto {
    @ApiProperty({
        example: [
            'd9acb5d9-4d83-411d-acb5-d94d83e11d74',
            '53c20f79-ed6a-4785-820f-79ed6a878520',
        ],
    })
    @IsArray()
    @IsOptional()
    photoIds?: string[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ReviewIdParamsDto {
    @ApiProperty({
        description: 'ID отзыва',
        example: 1,
    })
    @IsUUID()
    id: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class ReviewIdParamsDto {
  @ApiProperty({
    description: 'ID отзыва',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

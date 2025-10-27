import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { PaginationQueryDto } from './pagination.query.dto';

export class UserReviewsParamsDto {
  @ApiProperty({
    description: 'ID пользователя',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId: number;
}

export class UserReviewsQueryDto extends PaginationQueryDto {}

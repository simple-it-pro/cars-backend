import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { PaginationQueryDto } from './pagination.query.dto';

export class UserReviewsParamsDto {
    @ApiProperty({
        description: 'ID пользователя',
        example: 1,
    })
    @IsUUID()
    userId: string;
}

export class UserReviewsQueryDto extends PaginationQueryDto {}

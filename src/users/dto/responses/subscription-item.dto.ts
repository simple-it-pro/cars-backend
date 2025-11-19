import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { SubscriptionUserDto } from './subscription-user.dto';

@Exclude()
export class SubscriptionItemDto {
    @Expose()
    @ApiProperty({ example: 'd9f5d044-15ac-4300-a97f-929c5777f1fd' })
    id: string;

    @Expose()
    @ApiProperty({ example: '2025-11-19T10:05:59.607Z' })
    createdAt: Date;

    @Expose()
    @Type(() => SubscriptionUserDto)
    @ApiProperty({ type: SubscriptionUserDto })
    user: SubscriptionUserDto;
}

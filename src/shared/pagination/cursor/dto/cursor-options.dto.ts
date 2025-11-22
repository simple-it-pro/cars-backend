import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';

import { Order } from '../../enums';
import { parseCompositeCursor } from '../utils';

export class CursorOptionsDto {
    @ApiPropertyOptional({ enum: Order, default: Order.DESC })
    @IsEnum(Order)
    @IsOptional()
    readonly order?: Order = Order.DESC;

    @ApiPropertyOptional()
    @Type(() => String)
    @IsString()
    @IsOptional()
    readonly cursor?: string;

    @ApiPropertyOptional({
        minimum: 1,
        maximum: 50,
        default: 10,
    })
    @Type(() => Number)
    @Transform(({ value }) =>
        typeof value !== 'number' || isNaN(value) ? 11 : value + 1,
    )
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    readonly take: number = 11;

    get parsedCursor() {
        if (!this.cursor) return;

        return parseCompositeCursor(this.cursor);
    }
}

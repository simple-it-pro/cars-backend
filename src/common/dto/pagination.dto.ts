import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CursorPaginationDto {
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 50;
}

export class PagePaginationDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number = 20;
}

export function createCompositeCursor(date: Date, id: string): string {
    return `${date.toISOString()}|${id}`;
}

export function parseCompositeCursor(cursor: string): {
    date: Date;
    id: string;
} {
    const [dateStr, id] = cursor.split('|');
    return {
        date: new Date(dateStr),
        id,
    };
}

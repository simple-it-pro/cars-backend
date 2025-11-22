import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CursorMetaDtoParameters } from '../interfaces';

export class CursorMetaDto {
    @ApiPropertyOptional()
    readonly cursor?: string;

    @ApiProperty()
    readonly take: number;

    @ApiProperty()
    readonly itemCount: number;

    @ApiPropertyOptional()
    readonly nextCursor?: string;

    @ApiProperty()
    readonly hasNextPage: boolean;

    @ApiPropertyOptional()
    readonly hasPreviousPage?: boolean;

    constructor({
        cursorOptionsDto,
        itemCount,
        hasNextPage,
        hasPreviousPage,
        nextCursor,
    }: CursorMetaDtoParameters) {
        this.cursor = cursorOptionsDto.cursor;
        this.take = cursorOptionsDto.take - 1;
        this.itemCount = itemCount;
        this.hasNextPage = hasNextPage;
        this.hasPreviousPage = hasPreviousPage;
        this.nextCursor = nextCursor;
    }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

import { CursorMetaDto } from './cursor-meta.dto';
import { CursorEntity } from '../interfaces';

export class CursorDto<T extends CursorEntity> {
    @IsArray()
    @ApiProperty({ isArray: true })
    readonly items: T[];

    @ApiProperty({ type: () => CursorMetaDto })
    readonly meta: CursorMetaDto;

    constructor(data: T[], meta: CursorMetaDto) {
        if (data.length > meta.take) {
            this.items = data.slice(0, meta.take);
        } else {
            this.items = data;
        }
        this.meta = meta;
    }
}

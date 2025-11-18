import { CursorMetaDto, CursorOptionsDto } from '../dto';
import { CursorEntity } from '../interfaces';
import { createCompositeCursor } from './create-composite-cursor';

export const createCursorMeta = <T extends CursorEntity>(
    cursorOptionsDto: CursorOptionsDto,
    items: T[],
    itemCount: number,
    hasPreviousPage?: boolean,
) => {
    const hasNextPage = items.length === cursorOptionsDto.take;

    const currentPageItems = hasNextPage ? items.slice(0, -1) : items;

    const lastItem = currentPageItems.length
        ? currentPageItems[currentPageItems.length - 1]
        : undefined;

    const nextCursor =
        lastItem && hasNextPage
            ? createCompositeCursor(lastItem.createdAt, lastItem.id)
            : undefined;

    return new CursorMetaDto({
        hasPreviousPage,
        nextCursor,
        itemCount,
        hasNextPage,
        cursorOptionsDto,
    });
};

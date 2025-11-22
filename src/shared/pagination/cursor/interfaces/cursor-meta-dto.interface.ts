import { CursorOptionsDto } from '../dto';

export interface CursorMetaDtoParameters {
    cursorOptionsDto: CursorOptionsDto;
    itemCount: number;
    hasNextPage: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
}

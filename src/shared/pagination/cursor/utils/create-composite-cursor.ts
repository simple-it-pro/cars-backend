import { InvalidCursorException } from '../exceptions';

export const createCompositeCursor = (date: Date, id: string): string => {
    if (!date || !id) {
        throw new InvalidCursorException(
            'Для создания курсора необходимо передать дату создания и id сущности',
        );
    }
    return `${date.toISOString()}|${id}`;
};

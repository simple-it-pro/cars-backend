import { InvalidCursorException } from '../exceptions';

export const parseCompositeCursor = (
    cursor: string,
): {
    date: Date;
    id: string;
} => {
    if (!cursor)
        throw new InvalidCursorException(
            'Курсор не должен быть пустой строкой',
        );

    const parts = cursor.split('|');
    if (parts.length !== 2)
        throw new InvalidCursorException('Не удалось распарсить курсор');

    const [dateStr, id] = parts;
    if (!(dateStr && id))
        throw new InvalidCursorException(
            'В курсоре нет данных о дате или об id сущности',
        );

    const date = new Date(dateStr);
    if (isNaN(date.getTime()))
        throw new InvalidCursorException('Неверный формат даты в курсоре');

    return {
        date,
        id,
    };
};

import { BadRequestException } from '@nestjs/common';

export class InvalidCursorException extends BadRequestException {
    constructor(message = 'Неверный формат курсора') {
        super(message);
    }
}

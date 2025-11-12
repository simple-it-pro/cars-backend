import { Injectable } from '@nestjs/common';

@Injectable()
export class GarageService {
    create() {
        return 'This action adds a new garage';
    }

    findAll() {
        return `This action returns all garage`;
    }

    findOne(id: number) {
        return `This action returns a #${id} garage`;
    }

    update(id: number) {
        return `This action updates a #${id} garage`;
    }

    remove(id: number) {
        return `This action removes a #${id} garage`;
    }
}

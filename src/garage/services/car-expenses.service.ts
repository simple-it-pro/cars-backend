import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CarExpense } from '../../database/entities';

import { CreateCarExpenseDto, UpdateCarExpenseDto } from '../dto';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { GarageService } from './garage.service';

@Injectable()
export class CarExpensesService {
    constructor(
        @InjectRepository(CarExpense)
        private readonly expenseRepository: Repository<CarExpense>,
        private readonly garageService: GarageService,
    ) {}

    async getAll(userId: string, carId: string) {
        await this.garageService.getUserCarAndCheckOwnership(userId, carId);

        const [expenses, total] = await this.expenseRepository.findAndCount({
            where: { car: { id: carId } },
            order: { date: 'DESC', createdAt: 'DESC' },
        });

        return {
            expenses,
            total,
        };
    }

    async getOne(userId: string, carId: string, expenseId: string) {
        await this.garageService.getUserCarAndCheckOwnership(userId, carId);

        const expense = await this.expenseRepository.findOne({
            where: { id: expenseId, car: { id: carId } },
        });

        if (!expense) {
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.EXPENSE.NOT_FOUND,
            );
        }

        return expense;
    }

    async create(userId: string, carId: string, dto: CreateCarExpenseDto) {
        const car = await this.garageService.getUserCarAndCheckOwnership(
            userId,
            carId,
        );

        const date = dto.date ?? new Date();

        const expense = this.expenseRepository.create({
            ...dto,
            date,
            car,
        });

        const saved = await this.expenseRepository.save(expense);

        return {
            message: SUCCESS_MESSAGES.GARAGE.EXPENSE.CREATED,
            expense: saved,
        };
    }

    async update(
        userId: string,
        carId: string,
        expenseId: string,
        dto: UpdateCarExpenseDto,
    ) {
        await this.garageService.getUserCarAndCheckOwnership(userId, carId);

        const expense = await this.expenseRepository.findOne({
            where: { id: expenseId, car: { id: carId } },
        });

        if (!expense) {
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.EXPENSE?.NOT_FOUND,
            );
        }

        const updated = await this.expenseRepository.save({
            ...expense,
            ...dto,
        });

        return {
            message: SUCCESS_MESSAGES.GARAGE.EXPENSE.UPDATED,
            expense: updated,
        };
    }

    async delete(userId: string, carId: string, expenseId: string) {
        await this.garageService.getUserCarAndCheckOwnership(userId, carId);

        await this.expenseRepository.delete({
            id: expenseId,
            car: { id: carId },
        });

        return {
            message: SUCCESS_MESSAGES.GARAGE.EXPENSE.DELETED,
        };
    }
}

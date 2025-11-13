import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Car, CarExpense } from '../../database/entities';

import { CreateCarExpenseDto, UpdateCarExpenseDto } from '../dto';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';

@Injectable()
export class CarExpensesService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
        @InjectRepository(CarExpense)
        private readonly expenseRepository: Repository<CarExpense>,
    ) {}

    private async getUserCar(userId: string, carId: string): Promise<Car> {
        const car = await this.carRepository.findOne({
            where: { id: carId, owner: { id: userId } },
        });

        if (!car) {
            throw new NotFoundException(ERROR_MESSAGES.GARAGE.CAR.NOT_FOUND);
        }

        return car;
    }

    async getAll(userId: string, carId: string) {
        await this.getUserCar(userId, carId);

        const expenses = await this.expenseRepository.find({
            where: { carId },
            order: { date: 'DESC', createdAt: 'DESC' },
        });

        return {
            expenses,
            total: expenses.length,
        };
    }

    async getOne(userId: string, carId: string, expenseId: string) {
        await this.getUserCar(userId, carId);

        const expense = await this.expenseRepository.findOne({
            where: { id: expenseId, carId },
        });

        if (!expense) {
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.EXPENSE.NOT_FOUND,
            );
        }

        return expense;
    }

    async create(userId: string, carId: string, dto: CreateCarExpenseDto) {
        const car = await this.getUserCar(userId, carId);

        const date = dto.date ?? new Date();

        const expense = this.expenseRepository.create({
            ...dto,
            date,
            carId: car.id,
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
        await this.getUserCar(userId, carId);

        const expense = await this.expenseRepository.findOne({
            where: { id: expenseId, carId },
        });

        if (!expense) {
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.EXPENSE?.NOT_FOUND,
            );
        }

        Object.assign(expense, dto);

        const updated = await this.expenseRepository.save(expense);

        return {
            message: SUCCESS_MESSAGES.GARAGE.EXPENSE.UPDATED,
            expense: updated,
        };
    }

    async delete(userId: string, carId: string, expenseId: string) {
        await this.getUserCar(userId, carId);

        const expense = await this.expenseRepository.findOne({
            where: { id: expenseId, carId },
        });

        if (!expense) {
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.EXPENSE.NOT_FOUND,
            );
        }

        await this.expenseRepository.remove(expense);

        return {
            message: SUCCESS_MESSAGES.GARAGE.EXPENSE.DELETED,
        };
    }
}

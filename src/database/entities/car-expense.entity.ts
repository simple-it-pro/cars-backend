import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Car } from '.';
import { ExpenseTypes } from '../enums/cars';
import { numericToNumber } from '../utils';

@Entity('car_expenses')
class CarExpense {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор расхода',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Автомобиль, к которому относится расход',
        type: () => Car,
    })
    @ManyToOne(() => Car, (car) => car.expenses, {
        onDelete: 'CASCADE',
    })
    car: Car;

    @ApiProperty({
        example: ExpenseTypes.FUEL,
        description: 'Тип расхода (например, Топливо, Ремонт, Мойка)',
        enum: ExpenseTypes,
    })
    @Column({
        type: 'enum',
        enum: ExpenseTypes,
    })
    type: ExpenseTypes;

    @ApiProperty({
        example: 5500.5,
        description: 'Сумма расхода',
    })
    @Column({ type: 'numeric', transformer: numericToNumber })
    amount: number;

    @ApiProperty({
        example: '2025-10-15T10:30:00.000Z',
        description: 'Дата совершения расхода',
        type: 'string',
        format: 'date-time',
    })
    @Column({ type: 'timestamptz' })
    date: Date;

    @ApiPropertyOptional({
        example: 125000,
        description: 'Пробег автомобиля на момент расхода, км',
    })
    @Column({ type: 'int', nullable: true })
    mileageKm?: number | null;

    @ApiPropertyOptional({
        example: 'Заправка АИ-95 на Лукойл',
        description: 'Описание расхода',
    })
    @Column({ type: 'text', nullable: true })
    description?: string | null;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата и время создания записи',
    })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: '2025-10-01T12:00:00.000Z',
        description: 'Дата и время последнего обновления записи',
    })
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}

export default CarExpense;

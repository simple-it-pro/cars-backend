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
import { numericToNumber } from '../utils';

@Entity('car_service_records')
class ServiceRecord {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор записи об обслуживании',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Car, (car) => car.serviceRecords, {
        onDelete: 'CASCADE',
    })
    car: Car;

    @ApiProperty({
        example: '2025-10-01T10:00:00.000Z',
        description: 'Дата выполнения обслуживания',
        type: 'string',
        format: 'date-time',
    })
    @Column({ type: 'timestamptz' })
    serviceDate: Date;

    @ApiPropertyOptional({
        example: 130000,
        description: 'Пробег автомобиля на момент обслуживания, км',
    })
    @Column({ type: 'int', nullable: true })
    mileageKm?: number | null;

    @ApiProperty({
        example: 'Замена масла и масляного фильтра',
        description: 'Краткое описание выполненных работ',
    })
    @Column({ type: 'text' })
    description: string;

    @ApiPropertyOptional({
        example: 'СТО "Авто-Мастер"',
        description: 'Название или адрес сервисного центра',
    })
    @Column({ type: 'text', nullable: true })
    serviceCenter?: string | null;

    @ApiPropertyOptional({
        example: 8500.0,
        description: 'Общая стоимость обслуживания',
    })
    @Column({ type: 'numeric', nullable: true, transformer: numericToNumber })
    amount?: number | null;

    @ApiPropertyOptional({
        example: '2026-04-01T10:00:00.000Z',
        description: 'Планируемая дата следующего обслуживания',
        type: 'string',
        format: 'date-time',
    })
    @Column({ type: 'timestamptz', nullable: true })
    nextServiceDate?: Date | null;

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

export default ServiceRecord;

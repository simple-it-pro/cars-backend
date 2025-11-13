import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    Bodyworks,
    CarStatus,
    FuelTypes,
    TransmissionTypes,
} from '../enums/cars';
import { CarPhoto, User } from '.';

const numericToNumber = {
    to: (value: number | null | undefined) =>
        value === undefined ? null : value,
    from: (value: string | null) =>
        value === null ? null : Number.parseFloat(value),
};

@Entity({ name: 'cars' })
@Index('idx_cars_owner_status', ['owner', 'status'])
@Index('idx_cars_make_model_year', ['make', 'model', 'year'])
@Check('chk_cars_mileage_nonneg', '"mileageKm" >= 0')
class Car {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор автомобиля',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата и время создания записи',
    })
    @Index('idx_car_created_at')
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: '2025-10-01T12:00:00.000Z',
        description: 'Дата и время последнего обновления записи',
    })
    @Index('idx_car_updated_at')
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ApiProperty({
        example: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        description: 'Владелец автомобиля',
        type: () => User,
    })
    @ManyToOne(() => User, (user) => user.cars, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ownerId' })
    owner: User;

    @Column({ type: 'uuid' })
    ownerId: string;

    @ApiProperty({ example: 'Toyota', description: 'Марка автомобиля' })
    @Column({ type: 'varchar', length: 80 })
    make: string;

    @ApiProperty({ example: 'Camry', description: 'Модель автомобиля' })
    @Column({ type: 'varchar', length: 120 })
    model: string;

    @ApiProperty({ example: 2020, description: 'Год выпуска автомобиля' })
    @Column({ type: 'smallint' })
    year: number;

    @ApiProperty({
        example: Bodyworks.COUPE,
        description: 'Тип кузова автомобиля',
        enum: Bodyworks,
    })
    @Column({ type: 'enum', enum: Bodyworks })
    bodywork: Bodyworks;

    @ApiProperty({
        example: FuelTypes.PETROL,
        description: 'Тип топлива',
        enum: FuelTypes,
    })
    @Column({ type: 'enum', enum: FuelTypes })
    fuelType: FuelTypes;

    @ApiProperty({
        example: TransmissionTypes.AT,
        description: 'Тип коробки передач',
        enum: TransmissionTypes,
    })
    @Column({ type: 'enum', enum: TransmissionTypes })
    transmission: TransmissionTypes;

    @ApiProperty({
        example: 45000,
        description: 'Пробег, км (неотрицательное целое число)',
    })
    @Column({ type: 'integer', default: 0 })
    mileageKm: number;

    @ApiPropertyOptional({ example: 'Белый', description: 'Цвет кузова' })
    @Column({ type: 'varchar', length: 60, nullable: true })
    color?: string | null;

    @ApiPropertyOptional({ example: 181, description: 'Мощность, л.с.' })
    @Column({ type: 'integer', nullable: true })
    powerHp?: number | null;

    @ApiPropertyOptional({
        example: 2.5,
        description: 'Объём двигателя, л',
    })
    @Column({
        type: 'numeric',
        precision: 3,
        scale: 1,
        nullable: true,
        transformer: numericToNumber,
    })
    engineVolumeL?: number | null;

    @ApiProperty({
        example: CarStatus.WAREHOUSE,
        description: 'Статус автомобиля',
        enum: CarStatus,
    })
    @Index('idx_cars_status')
    @Column({ type: 'enum', enum: CarStatus, default: CarStatus.WAREHOUSE })
    status: CarStatus;

    @ApiPropertyOptional({
        example: 1250000.0,
        description: 'Цена в валюте проекта (decimal, хранится точно)',
    })
    @Column({
        type: 'numeric',
        precision: 12,
        scale: 2,
        nullable: true,
        transformer: numericToNumber,
    })
    price?: number | null;

    @ApiPropertyOptional({
        example: 7.8,
        description: 'Расход топлива, л/100 км (ручной ввод владельца)',
    })
    @Column({
        type: 'numeric',
        precision: 5,
        scale: 2,
        nullable: true,
        transformer: numericToNumber,
    })
    fuelConsumption?: number | null;

    @OneToMany(() => CarPhoto, (photo) => photo.car, { eager: true })
    photos: CarPhoto[];
}

export default Car;

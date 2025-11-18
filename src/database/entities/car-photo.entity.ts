import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    JoinColumn,
    Column,
    Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import Car from './car.entity';
import { FileEntity } from '.';

@Entity({ name: 'car_photos' })
@Index(['carId', 'order'])
class CarPhoto {
    @ApiProperty({ example: 'uuid' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'ID автомобиля' })
    @Column({ type: 'uuid' })
    carId: string;

    @ManyToOne(() => Car, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'carId' })
    car: Car;

    @ApiProperty({ description: 'ID файла' })
    @Column({ type: 'uuid' })
    fileId: string;

    @ManyToOne(() => FileEntity, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'fileId' })
    file: FileEntity;

    @ApiProperty({ example: 0, description: 'Порядок' })
    @Column({ type: 'int' })
    order: number;
}

export default CarPhoto;

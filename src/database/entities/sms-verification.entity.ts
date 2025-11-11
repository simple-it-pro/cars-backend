import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'sms_verifications' })
class SmsVerification {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор ',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: '+79991234567' })
    @Column({ length: 20 })
    @Index()
    phone: string;

    @ApiProperty({ description: 'Хэш кода подтверждения' })
    @Column()
    codeHash: string;

    @ApiProperty({ example: 0, description: 'Количество попыток ввода' })
    @Column({ default: 0 })
    attempts: number;

    @ApiProperty({ example: false, description: 'Заблокирован ли номер' })
    @Column({ default: false })
    isBlocked: boolean;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Время разблокировки',
    })
    @Column({ type: 'timestamptz', nullable: true })
    blockedUntil: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Время истечения кода',
    })
    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @ApiProperty({ example: '2025-09-14T08:57:59.589Z' })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;
}

export default SmsVerification;

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../../common/types';
import User from './user.entity';

@Entity('notifications')
class Notification {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        type: () => User,
        description: 'Пользователь',
    })
    @ManyToOne(() => User, { eager: true })
    @JoinColumn()
    user: User;

    @Column()
    @ApiProperty({ example: 'like' })
    type: NotificationType;

    @Column()
    @ApiProperty({
        example: 'Поздравляем',
    })
    title: string;

    @Column()
    @ApiProperty({
        example: 'Вы получили лайк на ваше сообщение',
    })
    description: string;

    @Column({ default: false })
    @ApiProperty({
        example: false,
    })
    isRead: boolean;
}

export default Notification;

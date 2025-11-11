import {
    CreateDateColumn,
    Entity,
    Index,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './';

@Entity({ name: 'user_block' })
class UserBlock {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @Index('idx_user_block_created_at')
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
    })
    @Index('idx_user_block_updated_at')
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.userBlocks)
    user: User;

    @ManyToOne(() => User, (user) => user.blockedUsers)
    blockedUser: User;
}
export default UserBlock;

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'attachements' })
class Attachement {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор вложения',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'photo.jpg',
        description: 'Название вложения',
    })
    @Column()
    name: string;
}

export default Attachement;

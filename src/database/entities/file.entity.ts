import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { FileStatusEnum, FileTypeEnum } from '../enums';
import PostFile from './post-file.entity';

@Entity({ name: 'files' })
class FileEntity {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Уникальный идентификатор файла',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'photo.jpg',
        description: 'Название файла',
    })
    @Column()
    name: string;

    @ApiProperty({
        example: FileTypeEnum.IMAGE,
        description: 'Тип файла',
        enum: FileTypeEnum,
    })
    @Column({ type: 'enum', enum: FileTypeEnum })
    type: FileTypeEnum;

    @ApiPropertyOptional({
        example: 'https://example.com/image.jpg',
        description: 'URL файла',
    })
    @Column({ nullable: true })
    url?: string;

    @ApiProperty({
        example: 1024000,
        description: 'Размер файла в байтах',
    })
    @Column()
    size: number;

    @ApiProperty({
        example: 'jpg',
        description: 'Расширение файла',
    })
    @Column()
    ext: string;

    @ApiProperty({
        example: FileStatusEnum.ATTACHED,
        description: 'Статус файла',
        enum: FileStatusEnum,
    })
    @Column({
        type: 'enum',
        enum: FileStatusEnum,
        default: FileStatusEnum.TEMPORARY,
    })
    status: FileStatusEnum;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата создания файла',
    })
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ApiProperty({
        example: '2025-09-14T08:57:59.589Z',
        description: 'Дата обновления файла',
    })
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToOne(() => PostFile, (postFile) => postFile.file)
    postFile: PostFile;
}

export default FileEntity;

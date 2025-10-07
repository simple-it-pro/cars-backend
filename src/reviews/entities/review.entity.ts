import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    example: 1,
  })
  id: number;

  @ApiProperty({
    example: '2025-09-14T08:57:59.589Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    example: '2025-09-14T08:57:59.589Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ length: 200 })
  content: string;

  @Column({ nullable: true, length: 200 })
  answer?: string;

  @Column('integer')
  @IsInt()
  @Min(1)
  @Max(5)
  rank: number;

  @ApiProperty({
    example: [
      {
        url: 'https://example.com/image.jpg',
        name: 'photo.jpg',
        size: 1024000,
      },
    ],
    description: 'Изображения',
  })
  @Column('jsonb', { default: [] })
  images: Array<{
    url: string;
    name: string;
    size: number;
  }>;

  @ApiProperty({
    type: () => User,
    description: 'Автор отзыва',
  })
  @ManyToOne(() => User, { eager: true })
  author: User;

  @ApiProperty({
    type: () => User,
    description: 'Пользователь, которому оставили отзыв',
  })
  @ManyToOne(() => User, { eager: true })
  user: User;

  @ApiProperty({ description: 'Верифицирован ли отзыв' })
  @Column({ default: false })
  isVerified: boolean;
}

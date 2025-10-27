import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { reviewLength } from '../../common/constants/reviews';
import { Image } from '../../common/types/assets';

@Entity({ name: 'reviews' })
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

  @ApiProperty({
    example: 'Всё круто и чётко',
  })
  @Column({ length: reviewLength })
  content: string;

  @ApiProperty({
    example: 'Спасибо за хороший отзыв',
  })
  @Column({ nullable: true, length: reviewLength })
  answer?: string;

  @ApiProperty({
    example: '2025-09-14T08:57:59.589Z',
  })
  @Column({ nullable: true, type: 'timestamptz' })
  answeredAt?: Date;

  @ApiProperty({
    example: 5,
  })
  @Column('integer')
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
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(5, { message: 'Максимум можно добавить 5 изображений' })
  @Column('jsonb', { default: [] })
  images: Array<Image>;

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

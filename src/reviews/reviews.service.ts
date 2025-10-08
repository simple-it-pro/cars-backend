import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(createReviewDto: CreateReviewDto) {
    const { content, userId, rank, images, authorId } = createReviewDto;

    if (userId === authorId) {
      throw new Error('Нельзя оставить отзыв самому себе');
    }
    const [user, author] = await Promise.all([
      this.usersRepository.findOne({ where: { id: userId } }),
      this.usersRepository.findOne({ where: { id: authorId } }),
    ]);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    if (!author) {
      throw new NotFoundException('Автор не найден');
    }

    if (images && images.length > 5) {
      throw new BadRequestException('Можно прикрепить не более 5 изображений');
    }

    const review = this.reviewsRepository.create({
      content,
      rank,
      images: images || [],
      user,
      author,
    });

    return this.reviewsRepository.save(review);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    userId?: number;
    authorId?: number;
    isVerified?: boolean;
  }) {
    const {
      page = 1,
      limit = 10,
      userId,
      authorId,
      isVerified,
    } = options || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.author', 'author')
      .orderBy('review.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (userId) {
      queryBuilder.andWhere('review.userId = :userId', { userId });
    }

    if (authorId) {
      queryBuilder.andWhere('review.authorId = :authorId', { authorId });
    }

    if (isVerified !== undefined) {
      queryBuilder.andWhere('review.isVerified = :isVerified', { isVerified });
    }

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'author'],
    });

    if (!review) {
      throw new NotFoundException('Отзыв не найден');
    }

    return review;
  }

  async getVerifiedReviews(
    userId?: number,
    page: number = 1,
    limit: number = 10,
  ) {
    return this.findAll({
      page,
      limit,
      userId,
      isVerified: true,
    });
  }

  async getUserReceivedReviews(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    return await this.findAll({
      page,
      limit,
      userId,
    });
  }

  async getUserAuthoredReviews(
    authorId: number,
    page: number = 1,
    limit: number = 10,
  ) {
    return await this.findAll({
      page,
      limit,
      authorId,
    });
  }

  async answerReview(id: number, answer: string, userId: number) {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new BadRequestException('Вы можете отвечать только на свои отзывы');
    }

    if (answer.length > 200) {
      throw new BadRequestException(
        'Текст ответа не должен превышать 200 символов',
      );
    }

    review.answer = answer;
    review.answeredAt = new Date();

    return this.reviewsRepository.save(review);
  }

  async verifyReview(id: number) {
    const review = await this.findOne(id);
    review.isVerified = true;
    return this.reviewsRepository.save(review);
  }

  async unverifyReview(id: number) {
    const review = await this.findOne(id);
    review.isVerified = false;
    return this.reviewsRepository.save(review);
  }
}

export default ReviewsService;

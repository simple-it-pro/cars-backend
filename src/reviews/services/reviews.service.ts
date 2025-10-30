import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review, User } from '../../database/entities';
import { Image } from '../../database/interfaces';
import { reviewLength } from '../../common/constants/reviews';
import { AnswerReviewDto, CreateReviewDto } from '../dto';
import { JwtUserData } from '../../users/types';
import { StorageService } from '../../storage/services';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { RatingService } from '../../users/services';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewsRepository: Repository<Review>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly storageService: StorageService,
        private readonly ratingService: RatingService,
    ) {}

    private validateImageFiles(files: Express.Multer.File[]): void {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        for (const file of files) {
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new BadRequestException(
                    `${ERROR_MESSAGES.REVIEW.INVALID_FILE_TYPE}. Разрешенные типы: ${allowedMimeTypes.join(', ')}`,
                );
            }
        }
    }

    async create(
        createReviewDto: CreateReviewDto,
        userData: JwtUserData,
        images: Express.Multer.File[],
    ) {
        const { content, userId, rank } = createReviewDto;
        const authorId = userData.sub;

        if (userId === authorId)
            throw new BadRequestException(ERROR_MESSAGES.REVIEW.SELF_REVIEW);

        const [user, author] = await Promise.all([
            this.usersRepository.findOne({ where: { id: userId } }),
            this.usersRepository.findOne({ where: { id: authorId } }),
        ]);

        if (!user)
            throw new NotFoundException(ERROR_MESSAGES.REVIEW.USER_NOT_FOUND);

        if (!author)
            throw new NotFoundException(ERROR_MESSAGES.REVIEW.AUTHOR_NOT_FOUND);

        if (images && images.length > 5)
            throw new BadRequestException(
                ERROR_MESSAGES.REVIEW.TOO_MANY_IMAGES,
            );

        if (images) this.validateImageFiles(images);

        const reviewImages: Image[] = [];

        if (images) {
            for (const image of images) {
                const key = await this.storageService.uploadFile(image);

                reviewImages.push({
                    url: key,
                    size: image.size,
                    name: image.originalname,
                });
            }
        }

        const review = this.reviewsRepository.create({
            content,
            rank,
            images: reviewImages,
            user,
            author,
        });

        await this.ratingService.calculateAndUpdateUserRating(userId);

        await this.reviewsRepository.save(review);

        const reviewWithUrls = await this.addSignedUrlsToReview(review);
        return {
            message: SUCCESS_MESSAGES.REVIEW.CREATED,
            review: reviewWithUrls,
        };
    }

    async findOne(id: number) {
        const review = await this.reviewsRepository.findOne({
            where: { id },
            relations: ['user', 'author'],
        });

        if (!review)
            throw new NotFoundException(ERROR_MESSAGES.REVIEW.NOT_FOUND);

        return this.addSignedUrlsToReview(review);
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

        if (userId)
            queryBuilder.andWhere('review.userId = :userId', { userId });

        if (authorId)
            queryBuilder.andWhere('review.authorId = :authorId', { authorId });

        if (isVerified !== undefined)
            queryBuilder.andWhere('review.isVerified = :isVerified', {
                isVerified,
            });

        const [reviews, total] = await queryBuilder.getManyAndCount();
        const reviewsWithUrls = await Promise.all(
            reviews.map((review) => this.addSignedUrlsToReview(review)),
        );

        return {
            reviews: reviewsWithUrls,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }

    async getVerifiedReviews(
        userId?: number,
        page: number = 1,
        limit: number = 10,
    ) {
        return await this.findAll({
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

    async answerReview(id: number, userId: number, answerDto: AnswerReviewDto) {
        const review = await this.findOne(id);
        const { answer } = answerDto;

        if (review.user.id !== userId)
            throw new BadRequestException(
                ERROR_MESSAGES.REVIEW.ANSWER_FORBIDDEN,
            );

        if (answer.length > reviewLength)
            throw new BadRequestException(
                ERROR_MESSAGES.REVIEW.ANSWER_TOO_LONG,
            );

        review.answer = answer;
        review.answeredAt = new Date();

        await this.reviewsRepository.save(review);
        const reviewWithUrls = await this.addSignedUrlsToReview(review);
        return {
            message: SUCCESS_MESSAGES.REVIEW.ANSWERED,
            review: reviewWithUrls,
        };
    }

    async verifyReview(id: number) {
        const review = await this.findOne(id);
        review.isVerified = true;
        await this.reviewsRepository.save(review);
        const reviewWithUrls = await this.addSignedUrlsToReview(review);
        return {
            message: SUCCESS_MESSAGES.REVIEW.VERIFIED,
            review: reviewWithUrls,
        };
    }

    async unverifyReview(id: number) {
        const review = await this.findOne(id);
        review.isVerified = false;
        await this.reviewsRepository.save(review);
        const reviewWithUrls = await this.addSignedUrlsToReview(review);
        return {
            message: SUCCESS_MESSAGES.REVIEW.UNVERIFIED,
            review: reviewWithUrls,
        };
    }

    private async addSignedUrlsToReview(review: Review): Promise<Review> {
        if (review.images && review.images.length > 0) {
            const imagesWithUrls = await Promise.all(
                review.images.map(async (image) => ({
                    ...image,
                    url: await this.storageService.getFileUrl(image.url),
                })),
            );
            return {
                ...review,
                images: imagesWithUrls,
            };
        }
        return review;
    }
}

export default ReviewsService;

import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Review, User, UserBlock } from '../../database/entities';
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
import { NotificationsService } from '../../notifications/services';
import { NotificationMessages, NotificationType } from '../../common/types';
import {
    createCursorMeta,
    CursorDto,
    CursorOptionsDto,
} from '../../shared/pagination/cursor';
import { ReviewResponseDto } from '../dto/responses/review-response.dto';
import { Order } from '../../shared/pagination/enums';
import { plainToInstance } from 'class-transformer';
import { FileUrlsService } from '../../storage/services';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewsRepository: Repository<Review>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(UserBlock)
        private readonly userBlockRepository: Repository<UserBlock>,
        private readonly storageService: StorageService,
        private readonly fileUrlsService: FileUrlsService,
        private readonly ratingService: RatingService,
        private readonly notificationsService: NotificationsService,
    ) {}

    private async checkBlockStatus(
        authorId: string,
        targetUserId: string,
    ): Promise<void> {
        const [isBlocked, isBlockedBy] = await Promise.all([
            this.userBlockRepository.findOne({
                where: {
                    user: { id: authorId },
                    blockedUser: { id: targetUserId },
                },
            }),
            this.userBlockRepository.findOne({
                where: {
                    user: { id: targetUserId },
                    blockedUser: { id: authorId },
                },
            }),
        ]);

        if (isBlocked || isBlockedBy) {
            throw new ForbiddenException(
                ERROR_MESSAGES.REVIEW.BLOCKED_INTERACTION,
            );
        }
    }

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

        await this.checkBlockStatus(authorId, userId);

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

        await this.notificationsService.create(userId, {
            type: NotificationType.REVIEW,
            title: NotificationMessages.REVIEW,
            description: review.content,
        });

        const reviewWithUrls =
            await this.fileUrlsService.addSignedUrlsDeep(review);
        return {
            message: SUCCESS_MESSAGES.REVIEW.CREATED,
            review: reviewWithUrls,
        };
    }

    async findOne(id: string) {
        const review = await this.reviewsRepository.findOne({
            where: { id },
            relations: ['user', 'author'],
        });

        if (!review)
            throw new NotFoundException(ERROR_MESSAGES.REVIEW.NOT_FOUND);

        return this.fileUrlsService.addSignedUrlsDeep(review);
    }

    async findAll(
        cursorOptionsDto: CursorOptionsDto,
        filters?: {
            userId?: string;
            authorId?: string;
            isVerified?: boolean;
        },
    ): Promise<CursorDto<ReviewResponseDto>> {
        const qb = this.reviewsRepository
            .createQueryBuilder('review')
            .leftJoinAndSelect('review.user', 'user')
            .leftJoinAndSelect('review.author', 'author')
            .where('user.deletedAt IS NULL')
            .andWhere('author.deletedAt IS NULL')
            .andWhere('user.isDeactivated = :isDeactivated', {
                isDeactivated: false,
            })
            .andWhere('author.isDeactivated = :isDeactivated', {
                isDeactivated: false,
            });

        if (filters?.userId) {
            qb.andWhere('review.userId = :userId', { userId: filters.userId });
        }

        if (filters?.authorId) {
            qb.andWhere('review.authorId = :authorId', {
                authorId: filters.authorId,
            });
        }

        if (filters?.isVerified !== undefined) {
            qb.andWhere('review.isVerified = :isVerified', {
                isVerified: filters.isVerified,
            });
        }

        qb.orderBy('review.createdAt', cursorOptionsDto.order)
            .addOrderBy('review.id', cursorOptionsDto.order)
            .take(cursorOptionsDto.take);

        const itemCount = await qb.getCount();

        if (cursorOptionsDto.parsedCursor) {
            const { date, id } = cursorOptionsDto.parsedCursor;

            qb.andWhere(
                new Brackets((qb) => {
                    if (cursorOptionsDto.order === Order.DESC) {
                        qb.where('review.createdAt < :date', { date });
                        qb.orWhere(
                            'review.createdAt = :date AND review.id < :id',
                            { date, id },
                        );
                    } else {
                        qb.where('review.createdAt > :date', { date });
                        qb.orWhere(
                            'review.createdAt = :date AND review.id > :id',
                            { date, id },
                        );
                    }
                }),
            );
        }

        const reviews = await qb.getMany();
        const reviewsWithUrls = await Promise.all(
            reviews.map((review) =>
                this.fileUrlsService.addSignedUrlsDeep(review),
            ),
        );

        const reviewDtos = plainToInstance(ReviewResponseDto, reviewsWithUrls);

        return new CursorDto(
            reviewDtos,
            createCursorMeta(cursorOptionsDto, reviewDtos, itemCount),
        );
    }

    async getVerifiedReviews(
        cursorOptionsDto: CursorOptionsDto,
        userId?: string,
    ): Promise<CursorDto<ReviewResponseDto>> {
        return this.findAll(cursorOptionsDto, {
            userId,
            isVerified: true,
        });
    }

    async getUserReceivedReviews(
        userId: string,
        cursorOptionsDto: CursorOptionsDto,
    ): Promise<CursorDto<ReviewResponseDto>> {
        return this.findAll(cursorOptionsDto, { userId });
    }

    async getUserAuthoredReviews(
        authorId: string,
        cursorOptionsDto: CursorOptionsDto,
    ): Promise<CursorDto<ReviewResponseDto>> {
        return this.findAll(cursorOptionsDto, { authorId });
    }

    async answerReview(id: string, userId: string, answerDto: AnswerReviewDto) {
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

        await this.notificationsService.create(review.user.id, {
            type: NotificationType.REVIEW_ANSWER,
            title: NotificationMessages.REVIEW_ANSWER,
            description: review.content,
        });

        const reviewWithUrls =
            await this.fileUrlsService.addSignedUrlsDeep(review);
        return {
            message: SUCCESS_MESSAGES.REVIEW.ANSWERED,
            review: reviewWithUrls,
        };
    }

    async verifyReview(id: string) {
        const review = await this.findOne(id);
        review.isVerified = true;
        await this.reviewsRepository.save(review);
        const reviewWithUrls =
            await this.fileUrlsService.addSignedUrlsDeep(review);
        return {
            message: SUCCESS_MESSAGES.REVIEW.VERIFIED,
            review: reviewWithUrls,
        };
    }

    async unverifyReview(id: string) {
        const review = await this.findOne(id);
        review.isVerified = false;
        await this.reviewsRepository.save(review);
        const reviewWithUrls =
            await this.fileUrlsService.addSignedUrlsDeep(review);
        return {
            message: SUCCESS_MESSAGES.REVIEW.UNVERIFIED,
            review: reviewWithUrls,
        };
    }
}

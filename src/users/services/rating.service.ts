import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Review, User } from '../../database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class RatingService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async calculateUserRating(userId: number): Promise<number> {
        const reviews = await this.reviewRepository.find({
            where: { user: { id: userId } },
        });

        if (!reviews.length) return 0;

        const totalRating = reviews.reduce(
            (sum, review) => sum + review.rank,
            0,
        );
        const averageRating = totalRating / reviews.length;
        return parseFloat(averageRating.toFixed(2));
    }

    async calculateAndUpdateUserRating(userId: number): Promise<number> {
        const rating = await this.calculateUserRating(userId);
        await this.userRepository.update(userId, { rating });
        return rating;
    }
}

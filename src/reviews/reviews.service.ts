import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  async create(createReviewDto: CreateReviewDto) {
    const { content, userId, rank, images, authorId } = createReviewDto;
  }

  async getAllReviews() {}
  async getVerifiedReviews() {}

  async answerReview() {}
}

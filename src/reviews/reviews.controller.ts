import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import ReviewsService from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AnswerReviewDto } from './dto/answer-review.dto';
import { JwtGuard } from '../guard/jwt.guard';
import { AuthUser } from '../decorators/user.decorator';
import { JwtUserData } from '../users/types';
import { FilesInterceptor } from '@nestjs/platform-express';

import { GetReviewsQueryDto } from './dto/queries/get-reviews.query.dto';
import {
  UserReviewsParamsDto,
  UserReviewsQueryDto,
} from './dto/queries/user-reviews.query.dto';
import { ReviewIdParamsDto } from './dto/params/review-id.params.dto';

@Controller('reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Отзыв создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @UseInterceptors(FilesInterceptor('images', 5))
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @AuthUser() user: JwtUserData,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    return this.reviewsService.create(createReviewDto, user, images);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все отзывы (с пагинацией)' })
  async findAll(
    @Query() getReviewsQueryDto: GetReviewsQueryDto,
    @AuthUser() author?: JwtUserData,
  ) {
    return this.reviewsService.findAll({
      page: getReviewsQueryDto.page,
      limit: getReviewsQueryDto.limit,
      userId: getReviewsQueryDto.userId,
      authorId: author?.sub,
    });
  }

  @Get('verified')
  @ApiOperation({ summary: 'Получить верифицированные отзывы' })
  async getVerifiedReviews(@Query() getReviewsQueryDto: GetReviewsQueryDto) {
    return this.reviewsService.getVerifiedReviews(
      getReviewsQueryDto.userId,
      getReviewsQueryDto.page,
      getReviewsQueryDto.limit,
    );
  }

  @Get('user/:userId/received')
  @ApiOperation({ summary: 'Получить отзывы, полученные пользователем' })
  async getUserReceivedReviews(
    @Param() { userId }: UserReviewsParamsDto,
    @Query() { page, limit }: UserReviewsQueryDto,
  ) {
    return this.reviewsService.getUserReceivedReviews(userId, page, limit);
  }

  @Get('user/:userId/authored')
  @ApiOperation({ summary: 'Получить отзывы, написанные пользователем' })
  async getUserAuthoredReviews(
    @Param() { userId }: UserReviewsParamsDto,
    @Query() { page, limit }: UserReviewsQueryDto,
  ) {
    return this.reviewsService.getUserAuthoredReviews(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить отзыв по ID' })
  async findOne(@Param() { id }: ReviewIdParamsDto) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id/answer')
  @ApiOperation({ summary: 'Ответить на отзыв' })
  async answerReview(
    @Param() { id }: ReviewIdParamsDto,
    @AuthUser() { sub: userId }: JwtUserData,
    @Body() answerReviewDto: AnswerReviewDto,
  ) {
    return this.reviewsService.answerReview(id, userId, answerReviewDto);
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'Верифицировать отзыв (для админа)' })
  async verifyReview(@Param() { id }: ReviewIdParamsDto) {
    return this.reviewsService.verifyReview(id);
  }

  @Patch(':id/unverify')
  @ApiOperation({ summary: 'Снять верификацию с отзыва (для админа)' })
  async unverifyReview(@Param() { id }: ReviewIdParamsDto) {
    return this.reviewsService.unverifyReview(id);
  }
}

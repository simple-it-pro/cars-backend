import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import ReviewsService from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AnswerReviewDto } from './dto/answer-review.dto';
import { JwtGuard } from '../guard/jwt.guard';
import { AuthUser } from '../decorators/user.decorator';
import { JwtUserData } from '../users/types';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  @ApiResponse({ status: 201, description: 'Отзыв создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @UseGuards(JwtGuard)
  create(
    @Body() createReviewDto: CreateReviewDto,
    @AuthUser() user: JwtUserData,
  ) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @ApiBearerAuth('JWT-auth')
  @Get()
  @ApiOperation({ summary: 'Получить все отзывы (с пагинацией)' })
  @UseGuards(JwtGuard)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: number,
    @AuthUser() author?: JwtUserData,
  ) {
    return this.reviewsService.findAll({
      page,
      limit,
      userId,
      authorId: author?.sub,
    });
  }

  @ApiBearerAuth('JWT-auth')
  @Get('verified')
  @ApiOperation({ summary: 'Получить верифицированные отзывы' })
  @UseGuards(JwtGuard)
  getVerifiedReviews(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: number,
  ) {
    return this.reviewsService.getVerifiedReviews(userId, page, limit);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('user/:userId/received')
  @ApiOperation({ summary: 'Получить отзывы, полученные пользователем' })
  @UseGuards(JwtGuard)
  getUserReceivedReviews(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.getUserReceivedReviews(userId, page, limit);
  }

  @ApiBearerAuth('JWT-auth')
  @Get('user/:userId/authored')
  @ApiOperation({ summary: 'Получить отзывы, написанные пользователем' })
  @UseGuards(JwtGuard)
  getUserAuthoredReviews(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.reviewsService.getUserAuthoredReviews(userId, page, limit);
  }

  @ApiBearerAuth('JWT-auth')
  @Get(':id')
  @ApiOperation({ summary: 'Получить отзыв по ID' })
  @UseGuards(JwtGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id/answer')
  @ApiOperation({ summary: 'Ответить на отзыв' })
  @UseGuards(JwtGuard)
  answerReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() answerReviewDto: AnswerReviewDto,
  ) {
    return this.reviewsService.answerReview(id, answerReviewDto);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id/verify')
  @ApiOperation({ summary: 'Верифицировать отзыв (для админа)' })
  @UseGuards(JwtGuard)
  verifyReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.verifyReview(id);
  }

  @ApiBearerAuth('JWT-auth')
  @Patch(':id/unverify')
  @ApiOperation({ summary: 'Снять верификацию с отзыва (для админа)' })
  @UseGuards(JwtGuard)
  unverifyReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.unverifyReview(id);
  }
}

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
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtGuard } from '../guard/jwt.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({ summary: 'Создать отзыв' })
  @ApiResponse({ status: 201, description: 'Отзыв создан' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @UseGuards(JwtGuard)
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @ApiBearerAuth('JWT-auth')
  @Get()
  @ApiOperation({ summary: 'Получить все отзывы (с пагинацией)' })
  @UseGuards(JwtGuard)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('userId') userId?: number,
    @Query('authorId') authorId?: number,
  ) {
    return this.reviewsService.findAll({ page, limit, userId, authorId });
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
    @Body() updateReviewDto: UpdateReviewDto,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    return this.reviewsService.answerReview(id, updateReviewDto.answer, userId);
  }
}

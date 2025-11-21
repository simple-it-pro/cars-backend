import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';

import { ReviewsService } from '../services';
import { AnswerReviewDto, CreateReviewDto } from '../dto';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';

import {
    GetReviewsCursorQueryDto,
    GetUserReviewsCursorQueryDto,
} from '../dto/queries';
import { ReviewIdParamsDto } from '../dto/params';
import { REVIEWS_BODIES, REVIEWS_API_DOCS } from '../reviews.swagger';

@Controller()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post()
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.CREATE_REVIEW)
    @ApiConsumes('multipart/form-data')
    @ApiBody(REVIEWS_BODIES.CREATE_REVIEW)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.CREATE_REVIEW)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.BAD_REQUEST)
    @UseInterceptors(FilesInterceptor('images', 5))
    async create(
        @Body() createReviewDto: CreateReviewDto,
        @AuthUser() user: JwtUserData,
        @UploadedFiles() images: Express.Multer.File[],
    ) {
        return this.reviewsService.create(createReviewDto, user, images);
    }

    @Get()
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.FIND_ALL)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.FIND_ALL)
    async findAll(
        @Query() cursorOptionsDto: GetReviewsCursorQueryDto,
        @AuthUser() author?: JwtUserData,
    ) {
        return this.reviewsService.findAll(cursorOptionsDto, {
            userId: cursorOptionsDto.userId,
            authorId: author?.sub,
            isVerified: cursorOptionsDto.isVerified,
        });
    }

    @Get('verified')
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.GET_VERIFIED_REVIEWS)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.GET_VERIFIED_REVIEWS)
    async getVerifiedReviews(
        @Query() cursorOptionsDto: GetReviewsCursorQueryDto,
    ) {
        return this.reviewsService.getVerifiedReviews(
            cursorOptionsDto,
            cursorOptionsDto.userId,
        );
    }

    @Get('user/:userId/received')
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.GET_USER_RECEIVED_REVIEWS)
    @ApiParam(REVIEWS_API_DOCS.PARAMS.USER_ID)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.GET_USER_RECEIVED_REVIEWS)
    async getUserReceivedReviews(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Query() cursorOptionsDto: GetUserReviewsCursorQueryDto,
    ) {
        return this.reviewsService.getUserReceivedReviews(
            userId,
            cursorOptionsDto,
        );
    }

    @Get('user/:userId/authored')
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.GET_USER_AUTHORED_REVIEWS)
    @ApiParam(REVIEWS_API_DOCS.PARAMS.USER_ID)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.GET_USER_AUTHORED_REVIEWS)
    async getUserAuthoredReviews(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Query() cursorOptionsDto: GetUserReviewsCursorQueryDto,
    ) {
        return this.reviewsService.getUserAuthoredReviews(
            userId,
            cursorOptionsDto,
        );
    }

    @Get(':id')
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.FIND_ONE)
    @ApiParam(REVIEWS_API_DOCS.PARAMS.REVIEW_ID)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.FIND_ONE)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.NOT_FOUND)
    async findOne(@Param() { id }: ReviewIdParamsDto) {
        return this.reviewsService.findOne(id);
    }

    @Patch(':id/answer')
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.ANSWER_REVIEW)
    @ApiParam(REVIEWS_API_DOCS.PARAMS.REVIEW_ID)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.ANSWER_REVIEW)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.FORBIDDEN)
    async answerReview(
        @Param() { id }: ReviewIdParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() answerReviewDto: AnswerReviewDto,
    ) {
        return this.reviewsService.answerReview(id, userId, answerReviewDto);
    }

    @Patch(':id/verify')
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.VERIFY_REVIEW)
    @ApiParam(REVIEWS_API_DOCS.PARAMS.REVIEW_ID)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.VERIFY_REVIEW)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.NOT_FOUND)
    async verifyReview(@Param() { id }: ReviewIdParamsDto) {
        return this.reviewsService.verifyReview(id);
    }

    @Patch(':id/unverify')
    @ApiOperation(REVIEWS_API_DOCS.OPERATIONS.UNVERIFY_REVIEW)
    @ApiParam(REVIEWS_API_DOCS.PARAMS.REVIEW_ID)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.UNVERIFY_REVIEW)
    @ApiResponse(REVIEWS_API_DOCS.RESPONSES.NOT_FOUND)
    async unverifyReview(@Param() { id }: ReviewIdParamsDto) {
        return this.reviewsService.unverifyReview(id);
    }
}

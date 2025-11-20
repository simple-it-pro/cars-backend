import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { FeedService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { CursorOptionsDto } from '../../shared/pagination/cursor';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { FeedTypeEnum } from '../enums';
import { FEED_API_DOCS } from '../feed.swagger';

@ApiTags('Feed')
@Controller('feed')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    @Get()
    @ApiOperation(FEED_API_DOCS.OPERATIONS.GET_FEED)
    @ApiQuery(FEED_API_DOCS.QUERIES.FEED_TYPE)
    @ApiResponse(FEED_API_DOCS.RESPONSES.GET_FEED)
    @ApiResponse(FEED_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getFeed(
        @Query() cursorOptionsDto: CursorOptionsDto,
        @Query('feedType') feedType: FeedTypeEnum = FeedTypeEnum.ALL,
        @AuthUser() { sub: userId }: JwtUserData,
    ) {
        return this.feedService.getFeedItems(
            cursorOptionsDto,
            userId,
            feedType,
        );
    }
}

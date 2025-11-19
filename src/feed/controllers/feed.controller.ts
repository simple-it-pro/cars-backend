import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';

import { FeedService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { CursorOptionsDto } from '../../shared/pagination/cursor';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { FeedTypeEnum } from '../enums';

@ApiTags('Feed')
@Controller('feed')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    @Get()
    @ApiOperation({
        summary: 'Получить ленту постов',
        description:
            'Возвращает ленту постов с пагинацией. Можно фильтровать по типу: все посты или только от подписок',
    })
    @ApiQuery({
        name: 'feedType',
        enum: FeedTypeEnum,
        required: false,
        description:
            'Тип ленты: all - все посты, subscriptions - только от подписок',
        example: FeedTypeEnum.ALL,
    })
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

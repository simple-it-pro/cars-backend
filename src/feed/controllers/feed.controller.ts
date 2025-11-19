import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FeedService } from '../services';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../../auth/guards';
import { CursorOptionsDto } from '../../shared/pagination/cursor';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';

@ApiTags('Feed')
@Controller('feed')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    @Get()
    async getFeed(
        @Query() cursorOptionsDto: CursorOptionsDto,
        @AuthUser() { sub: userId }: JwtUserData,
    ) {
        return this.feedService.getFeedItems(cursorOptionsDto, userId);
    }
}

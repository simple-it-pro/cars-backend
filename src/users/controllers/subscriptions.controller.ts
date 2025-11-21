import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { SubscriptionsService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../types';
import { CursorOptionsDto } from '../../shared/pagination/cursor';
import { GetSubscriptionsQueryDto } from '../dto/queries';
import { SUBSCRIPTIONS_API_DOCS } from '../swagger';

@ApiTags('Users')
@Controller()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Get('subscriptions/:userId')
    @ApiOperation(SUBSCRIPTIONS_API_DOCS.OPERATIONS.GET_SUBSCRIPTIONS)
    @ApiParam(SUBSCRIPTIONS_API_DOCS.PARAMS.USER_ID)
    @ApiOkResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.GET_SUBSCRIPTIONS)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.NOT_FOUND)
    async getSubscriptions(
        @Param('userId') userId: string,
        @AuthUser() { sub: viewerId }: JwtUserData,
        @Query() cursorOptionsDto: CursorOptionsDto,
        @Query() queryDto: GetSubscriptionsQueryDto,
    ) {
        return this.subscriptionsService.getSubscriptions(
            userId,
            viewerId,
            cursorOptionsDto,
            queryDto,
        );
    }

    @Get('followers/:userId')
    @ApiOperation(SUBSCRIPTIONS_API_DOCS.OPERATIONS.GET_FOLLOWERS)
    @ApiParam(SUBSCRIPTIONS_API_DOCS.PARAMS.USER_ID)
    @ApiOkResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.GET_FOLLOWERS)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.NOT_FOUND)
    async getFollowers(
        @Param('userId') userId: string,
        @AuthUser() { sub: viewerId }: JwtUserData,
        @Query() cursorOptionsDto: CursorOptionsDto,
        @Query() queryDto: GetSubscriptionsQueryDto,
    ) {
        return this.subscriptionsService.getFollowers(
            userId,
            viewerId,
            cursorOptionsDto,
            queryDto,
        );
    }

    @Post('subscribe/:targetUserId')
    @ApiOperation(SUBSCRIPTIONS_API_DOCS.OPERATIONS.SUBSCRIBE_USER)
    @ApiParam(SUBSCRIPTIONS_API_DOCS.PARAMS.TARGET_USER_ID)
    @ApiOkResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.SUBSCRIBE_USER)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.FORBIDDEN)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.NOT_FOUND)
    async subscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('targetUserId') targetUserId: string,
    ) {
        return this.subscriptionsService.subscribeUser(userId, targetUserId);
    }

    @Delete('unsubscribe/:targetUserId')
    @ApiOperation(SUBSCRIPTIONS_API_DOCS.OPERATIONS.UNSUBSCRIBE_USER)
    @ApiParam(SUBSCRIPTIONS_API_DOCS.PARAMS.TARGET_USER_ID)
    @ApiOkResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.UNSUBSCRIBE_USER)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.BAD_REQUEST)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    @ApiResponse(SUBSCRIPTIONS_API_DOCS.RESPONSES.NOT_FOUND)
    async unsubscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('targetUserId') targetUserId: string,
    ) {
        return this.subscriptionsService.unsubscribeUser(userId, targetUserId);
    }
}

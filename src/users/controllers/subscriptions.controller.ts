import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guards';
import { SubscriptionsService } from '../services';
import { USERS_API_DOCS } from '../users.swagger';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../types';

@ApiTags('Users')
@Controller()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Get('subscriptions')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_SUBSCRIPTIONS_COUNTER)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_SUBSCRIPTIONS_COUNTER)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getSubscriptionsCounter(@AuthUser() { sub: userId }: JwtUserData) {
        return this.subscriptionsService.getSubscriptionsCounter(userId);
    }

    @Get('followers')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_FOLLOWERS_COUNTER)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_FOLLOWERS_COUNTER)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getFollowersCounter(@AuthUser() { sub: userId }: JwtUserData) {
        return this.subscriptionsService.getFollowersCounter(userId);
    }

    @Post('subscribe/:id')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.SUBSCRIBE)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.SUBSCRIBE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_SUBSCRIBE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async subscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('targetUserId', ParseUUIDPipe) targetUserId: string,
    ) {
        return this.subscriptionsService.subscribeUser(userId, targetUserId);
    }

    @Delete('unsubscribe/:id')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.UNSUBSCRIBE)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.UNSUBSCRIBE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_UNSUBSCRIBE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async unsubscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('targetUserId', ParseUUIDPipe) targetUserId: string,
    ) {
        return this.subscriptionsService.unsubscribeUser(userId, targetUserId);
    }

    @Get('subscriptions/:userId')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_SUBSCRIPTIONS)
    @ApiParam(USERS_API_DOCS.PARAMS.USER_ID)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_SUBSCRIPTIONS)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getUserSubscriptions(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.subscriptionsService.getSubscriptions(userId);
    }

    @Get('followers/:userId')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_FOLLOWERS)
    @ApiParam(USERS_API_DOCS.PARAMS.USER_ID)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_FOLLOWERS)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getUserFollowers(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.subscriptionsService.getFollowers(userId);
    }
}

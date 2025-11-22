import {
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { NotificationsService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { NotificationType } from '../../common/types';
import { NOTIFICATIONS_API_DOCS } from '../notifications.swagger';

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}

    @Get()
    @ApiOperation(NOTIFICATIONS_API_DOCS.OPERATIONS.GET_ALL)
    @ApiQuery(NOTIFICATIONS_API_DOCS.QUERIES.FILTER_TYPE)
    @ApiOkResponse(NOTIFICATIONS_API_DOCS.RESPONSES.GET_ALL)
    @ApiResponse(NOTIFICATIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getAll(
        @AuthUser() { sub: id }: JwtUserData,
        @Query('type') filterType?: NotificationType,
    ) {
        return this.notificationsService.getAll(id, filterType);
    }

    @Get('unread')
    @ApiOperation(NOTIFICATIONS_API_DOCS.OPERATIONS.GET_UNREAD)
    @ApiQuery(NOTIFICATIONS_API_DOCS.QUERIES.FILTER_TYPE)
    @ApiOkResponse(NOTIFICATIONS_API_DOCS.RESPONSES.GET_UNREAD)
    @ApiResponse(NOTIFICATIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getUnreadNotifications(
        @AuthUser() { sub: id }: JwtUserData,
        @Query('type') filterType?: NotificationType,
    ) {
        return this.notificationsService.getAll(id, filterType, true);
    }

    @Get('unread-count')
    @ApiOperation(NOTIFICATIONS_API_DOCS.OPERATIONS.GET_UNREAD_COUNT)
    @ApiOkResponse(NOTIFICATIONS_API_DOCS.RESPONSES.GET_UNREAD_COUNT)
    @ApiResponse(NOTIFICATIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getUnreadCount(@AuthUser() { sub: id }: JwtUserData) {
        return this.notificationsService.getUnreadCount(id);
    }

    @Patch(':id/read')
    @ApiOperation(NOTIFICATIONS_API_DOCS.OPERATIONS.MARK_AS_READ)
    @ApiParam(NOTIFICATIONS_API_DOCS.PARAMS.NOTIFICATION_ID)
    @ApiOkResponse(NOTIFICATIONS_API_DOCS.RESPONSES.MARK_AS_READ)
    @ApiResponse(NOTIFICATIONS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(NOTIFICATIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async markAsRead(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('id', ParseUUIDPipe) notificationId: string,
    ) {
        return this.notificationsService.markAsRead(userId, notificationId);
    }

    @Patch('mark-read')
    @ApiOperation(NOTIFICATIONS_API_DOCS.OPERATIONS.MARK_ALL_AS_READ)
    @ApiOkResponse(NOTIFICATIONS_API_DOCS.RESPONSES.MARK_ALL_AS_READ)
    @ApiResponse(NOTIFICATIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async markAllAsRead(@AuthUser() { sub: id }: JwtUserData) {
        return this.notificationsService.markAllAsRead(id);
    }

    @Delete(':id')
    @ApiOperation(NOTIFICATIONS_API_DOCS.OPERATIONS.DELETE)
    @ApiParam(NOTIFICATIONS_API_DOCS.PARAMS.NOTIFICATION_ID)
    @ApiOkResponse(NOTIFICATIONS_API_DOCS.RESPONSES.DELETE)
    @ApiResponse(NOTIFICATIONS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(NOTIFICATIONS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async remove(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('id', ParseUUIDPipe) notificationId: string,
    ) {
        return this.notificationsService.remove(userId, notificationId);
    }
}

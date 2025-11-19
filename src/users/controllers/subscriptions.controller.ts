import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiOkResponse,
} from '@nestjs/swagger';
import { SubscriptionsService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../types';
import { CursorOptionsDto, CursorDto } from '../../shared/pagination/cursor';
import { SubscriptionItemDto } from '../dto/responses';
import { GetSubscriptionsQueryDto } from '../dto/queries';

@ApiTags('Users')
@Controller()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) {}

    @Get('subscriptions/:userId')
    @ApiOperation({
        summary: 'Получить список подписок пользователя',
        description:
            'Возвращает список пользователей, на которых подписан указанный пользователь с пагинацией и поиском',
    })
    @ApiParam({
        name: 'userId',
        description: 'ID пользователя, чьи подписки нужно получить',
        example: 'c20ad4d7-6fe9-4759-8a27-a0c99bff6710',
    })
    @ApiOkResponse({
        description: 'Список подписок с пагинацией',
        type: CursorDto<SubscriptionItemDto>,
    })
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
    @ApiOperation({
        summary: 'Получить список фолловеров пользователя',
        description:
            'Возвращает список пользователей, которые подписаны на указанного пользователя с пагинацией и поиском',
    })
    @ApiParam({
        name: 'userId',
        description: 'ID пользователя, чьих фолловеров нужно получить',
        example: 'c20ad4d7-6fe9-4759-8a27-a0c99bff6710',
    })
    @ApiOkResponse({
        description: 'Список фолловеров с пагинацией',
        type: CursorDto<SubscriptionItemDto>,
    })
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
    @ApiOperation({
        summary: 'Подписаться на пользователя',
        description: 'Создает подписку на указанного пользователя',
    })
    @ApiParam({
        name: 'targetUserId',
        description: 'ID пользователя, на которого нужно подписаться',
        example: 'c20ad4d7-6fe9-4759-8a27-a0c99bff6710',
    })
    async subscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('targetUserId') targetUserId: string,
    ) {
        return this.subscriptionsService.subscribeUser(userId, targetUserId);
    }

    @Delete('unsubscribe/:targetUserId')
    @ApiOperation({
        summary: 'Отписаться от пользователя',
        description: 'Удаляет подписку на указанного пользователя',
    })
    @ApiParam({
        name: 'targetUserId',
        description: 'ID пользователя, от которого нужно отписаться',
        example: 'c20ad4d7-6fe9-4759-8a27-a0c99bff6710',
    })
    async unsubscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('targetUserId') targetUserId: string,
    ) {
        return this.subscriptionsService.unsubscribeUser(userId, targetUserId);
    }
}

import { Controller } from '@nestjs/common';
import { NotificationsService } from '../services';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}
}

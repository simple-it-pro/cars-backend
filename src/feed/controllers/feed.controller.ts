import { Controller } from '@nestjs/common';
import { FeedService } from '../services';

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) {}
}

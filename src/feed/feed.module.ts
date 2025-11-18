import { Module } from '@nestjs/common';
import { FeedService } from './services';
import { FeedController } from './controllers';

@Module({
    controllers: [FeedController],
    providers: [FeedService],
})
export class FeedModule {}

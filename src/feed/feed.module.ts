import { Module } from '@nestjs/common';
import { FeedService } from './services';
import { FeedController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription, UserBlock } from '../database/entities';
import { PostsModule } from '../posts/posts.module';

@Module({
    imports: [TypeOrmModule.forFeature([UserBlock, Subscription]), PostsModule],
    controllers: [FeedController],
    providers: [FeedService],
})
export class FeedModule {}

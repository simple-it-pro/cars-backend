import { Module } from '@nestjs/common';
import { FeedService } from './services';
import { FeedController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post, UserBlock } from '../database/entities';
import { PostsModule } from '../posts/posts.module';
import { FilesModule } from '../files/files.module';
import { HashtagsModule } from '../hastags/hastags.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Post, UserBlock]),
        PostsModule,
        FilesModule,
        HashtagsModule,
    ],
    controllers: [FeedController],
    providers: [FeedService],
})
export class FeedModule {}

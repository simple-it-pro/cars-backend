import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from '../database/entities';
import { PostsController } from './controllers';
import { PostsService } from './services';

@Module({
    imports: [TypeOrmModule.forFeature([Post])],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {}

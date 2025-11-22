import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsService, PostFilesService } from './services';
import { PostsController, PostsFilesController } from './controllers';
import { Post } from '../database/entities';
import { FilesModule } from '../files/files.module';
import { HashtagsModule } from '../hastags/hastags.module';

@Module({
    imports: [FilesModule, HashtagsModule, TypeOrmModule.forFeature([Post])],
    controllers: [PostsFilesController, PostsController],
    providers: [PostsService, PostFilesService],
    exports: [PostsService],
})
export class PostsModule {}

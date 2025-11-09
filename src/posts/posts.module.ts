import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostsService, PostFilesService } from './services';
import { PostsController, PostsFilesController } from './controllers';
import { Post } from '../database/entities';
import { FilesModule } from '../files/files.module';

@Module({
    imports: [FilesModule, TypeOrmModule.forFeature([Post])],
    controllers: [PostsFilesController, PostsController],
    providers: [PostsService, PostFilesService],
})
export class PostsModule {}

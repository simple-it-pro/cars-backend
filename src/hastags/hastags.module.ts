import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HashtagsService } from './services';
import { Hashtag } from '../database/entities';

@Module({
    imports: [TypeOrmModule.forFeature([Hashtag])],
    providers: [HashtagsService],
    exports: [HashtagsService],
})
export class HashtagsModule {}

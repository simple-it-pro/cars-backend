import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReviewsService } from './services';
import { ReviewsController } from './controllers';
import { StorageModule } from '../storage/storage.module';
import { User, Review } from '../database/entities';

@Module({
    imports: [TypeOrmModule.forFeature([Review, User]), StorageModule],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule {}

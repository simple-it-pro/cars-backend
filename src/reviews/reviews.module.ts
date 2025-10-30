import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReviewsService } from './services';
import { ReviewsController } from './controllers';
import { StorageModule } from '../storage/storage.module';
import { User, Review } from '../database/entities';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Review, User]),
        StorageModule,
        UsersModule,
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService],
})
export class ReviewsModule {}

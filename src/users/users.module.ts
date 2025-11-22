import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services';
import { UsersController } from './controllers';
import { User } from '../database/entities';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), StorageModule],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}

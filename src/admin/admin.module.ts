import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../database/entities';
import { AdminUsersController } from './controllers';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AdminUsersController],
})
export class AdminModule {}

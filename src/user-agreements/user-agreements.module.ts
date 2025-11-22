import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAgreement } from './entities/user-agreement.entity';
import { UserAgreementsController } from './user-agreements.controller';
import { UserAgreementsService } from './user-agreements.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserAgreement])],
  controllers: [UserAgreementsController],
  providers: [UserAgreementsService],
  exports: [UserAgreementsService],
})
export class UserAgreementsModule {}

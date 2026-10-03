import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouriersService } from './couriers.service';
import { CouriersController } from './couriers.controller';
import { CourierApplication } from './entities/courier-application.entity';
import { User } from '../users/entities/user.entity';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([CourierApplication, User]), CommonModule],
  providers: [CouriersService],
  controllers: [CouriersController],
  exports: [CouriersService],
})
export class CouriersModule {}

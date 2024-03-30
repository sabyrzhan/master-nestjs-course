import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './subject.entity';
import { Teacher } from './teacher.entity';
import { TrainingController } from './training.controller';
import { User } from '../auth/entity/User';
import { Profile } from '../auth/entity/Profile';

@Module({
  imports: [TypeOrmModule.forFeature([Subject, Teacher, User, Profile])],
  controllers: [TrainingController],
})
export class SchoolModule {}

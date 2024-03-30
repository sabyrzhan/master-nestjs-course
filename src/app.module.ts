import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';
import { SchoolModule } from './school/school.module';
import { Attendee } from './events/entity/Attendee';
import { Event } from './events/entity/Event';
import { Teacher } from './school/teacher.entity';
import { Subject } from './school/subject.entity';
import { Profile } from './auth/entity/Profile';
import { User } from './auth/entity/User';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'env/.env' }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: process.env['DB_HOST'],
      port: parseInt(process.env['DB_PORT']),
      username: process.env['DB_USERNAME'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_NAME'],
      synchronize: process.env['DB_SYNCHRONIZE'] === 'true',
      entities: [Attendee, Event, Subject, Teacher, Profile, User],
      autoLoadEntities: true,
    }),
    EventsModule,
    SchoolModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

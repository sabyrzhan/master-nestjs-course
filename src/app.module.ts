import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entity/Event';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'example',
      database: 'nest-events',
      entities: [Event],
      synchronize: true,
      logging: ['query', 'error'],
    }),
    TypeOrmModule.forFeature([Event]),
  ],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}

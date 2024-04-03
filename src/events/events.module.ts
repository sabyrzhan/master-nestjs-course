import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entity/Event';
import { EventsController } from './events.controller';
import { Attendee } from './entity/Attendee';
import { EventsService } from './service/EventsService';
import { AttendeesService } from './service/AttendeesService';
import { CurrentUserEventAttendanceController } from './current-user-event-attendance-controller';
import { EventAttendeesController } from './event-attendees.controller';
import { EventsOrganizerByUserController } from './events-organizer-by-user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Attendee])],
  controllers: [
    EventsController,
    CurrentUserEventAttendanceController,
    EventAttendeesController,
    EventsOrganizerByUserController,
  ],
  providers: [EventsService, AttendeesService],
})
export class EventsModule {}

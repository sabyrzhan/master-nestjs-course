import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { AttendeesService } from './service/AttendeesService';
import { Attendee } from './entity/Attendee';

@Controller('/events/:eventId/attendees')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventAttendeesController {
  constructor(private readonly service: AttendeesService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @Param('eventId', ParseIntPipe) eventId: number,
  ): Promise<Attendee[]> {
    return this.service.findByEventId(eventId);
  }
}

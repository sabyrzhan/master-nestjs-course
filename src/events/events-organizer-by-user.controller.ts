import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './service/EventsService';
import { PaginatedEvents } from './entity/Event';

@Controller('events-organized-by-user/:userId')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsOrganizerByUserController {
  constructor(private readonly service: EventsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', ParseIntPipe) page: number,
  ): Promise<PaginatedEvents> {
    return await this.service.getEventsOrganizedByUserIdPaginated(userId, {
      currentPage: page,
      limit: 10,
    });
  }
}

import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Query,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './service/EventsService';

@Controller('events-organized-by-user/:userId')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsOrganizerByUserController {
  constructor(private readonly service: EventsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Param('userId') userId: number, @Query('page') page: number) {
    return await this.service.getEventsOrganizedByUserIdPaginated(userId, {
      currentPage: page,
      limit: 10,
    });
  }
}

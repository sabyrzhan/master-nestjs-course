import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
  Query,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './service/EventsService';
import { AttendeesService } from './service/AttendeesService';
import { CreateAttendeeDTO } from './dto/CreateAttendeeDTO';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entity/User';
import { AuthGuardJwt } from '../auth/auth-guard.jwt';
import { PaginatedEvents } from './entity/Event';
import { Attendee } from './entity/Attendee';

@Controller('events-attendance')
@SerializeOptions({ strategy: 'excludeAll' })
export class CurrentUserEventAttendanceController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly attendeesService: AttendeesService,
  ) {}

  @Get()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async findAll(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
  ): Promise<PaginatedEvents> {
    return this.eventsService.getEventsAttendedByUserIdPaginated(user.id, {
      currentPage: page,
      limit: 5,
    });
  }

  @Get('/:eventId')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async findOne(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: User,
  ): Promise<Attendee> {
    const attendee = await this.attendeesService.findOneByEventIdAndUserId(
      eventId,
      user.id,
    );

    if (!attendee) {
      throw new NotFoundException();
    }

    return attendee;
  }

  @Put('/:eventId')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  public async createOrUpdate(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() input: CreateAttendeeDTO,
    @CurrentUser() user: User,
  ): Promise<Attendee> {
    return this.attendeesService.createOrUpdate(input, eventId, user.id);
  }
}

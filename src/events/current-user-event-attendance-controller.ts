import {
  Body,
  ClassSerializerInterceptor,
  Controller,
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
    @Query('page') page: number = 1,
  ) {
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
  ) {
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
  ) {
    return this.attendeesService.createOrUpdate(input, eventId, user.id);
  }
}

import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SerializeOptions,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDTO } from './dto/CreateEventDTO';
import { UpdateEventDTO } from './dto/UpdateEventDTO';
import { Event, PaginatedEvents } from './entity/Event';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsService } from './service/EventsService';
import { Attendee, AttendeeAnswerEnum } from './entity/Attendee';
import { ListEvents } from './dto/ListEvents';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/entity/User';
import { AuthGuardJwt } from '../auth/auth-guard.jwt';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    @InjectRepository(Event) private readonly repository: Repository<Event>,
    private readonly service: EventsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents): Promise<PaginatedEvents> {
    this.logger.log(`start: findAll(filter=${JSON.stringify(filter)})`);
    const events =
      await this.service.getEventsWithAttendeeCountFilteredPaginated(filter, {
        total: true,
        currentPage: filter.page,
        limit: 10,
      });
    this.logger.log(`end: findAll(): result=${events.data.length}`);
    return events;
  }

  @Get('/:id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Event> {
    this.logger.log(`start: findOne(id=${id})`);
    const event = await this.service.getEventWithAttendeeCount(id);

    if (!event) {
      this.logger.error(`Event with id=${id} not found`);
      throw new NotFoundException('Event not found');
    }

    this.logger.log(`end: findOne(id=${id}): result=${JSON.stringify(event)}`);

    return event;
  }

  @Post('/testCreate')
  async testCreate() {
    const newEvent = new Event();
    newEvent.name = 'Test event';
    newEvent.description = 'Test event description';
    newEvent.address = 'Test event address';
    newEvent.when = new Date();

    const attendee = new Attendee();
    attendee.answer = AttendeeAnswerEnum.Rejected;

    newEvent.attendees = [attendee];

    await this.repository.save(newEvent);
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  async create(
    @Body() data: CreateEventDTO,
    @CurrentUser() user: User,
  ): Promise<Event> {
    this.logger.log(`start: create(data): ${data}`);

    const result = await this.service.createEvent(data, user);

    this.logger.log(`end: create(data): result=${JSON.stringify(result)}`);

    return result;
  }

  @Patch('/:id')
  @UseGuards(AuthGuardJwt)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateEventDTO,
    @CurrentUser() user: User,
  ): Promise<Event> {
    this.logger.log(`start: update(id=${id}`);

    const result = await this.service.updateEvent(id, data, user);

    this.logger.log(`end: update(id): result=${JSON.stringify(result)}`);

    return result;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuardJwt)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<void> {
    this.logger.log(`start: remove(id=${id})`);
    const event = await this.service.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizer.id !== user.id) {
      throw new UnauthorizedException('You are not authorized to delete');
    }

    const result = await this.service.deleteEvent(id);
    if (result?.affected !== 1) {
      throw new NotFoundException();
    }
    this.logger.log(`end: remove(id=${id})`);
  }
}

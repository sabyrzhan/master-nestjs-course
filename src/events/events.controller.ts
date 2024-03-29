import {
  Body,
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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDTO } from './dto/CreateEventDTO';
import { UpdateEventDTO } from './dto/UpdateEventDTO';
import { Event } from './entity/Event';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsService } from './service/EventsService';
import { Attendee, AttendeeAnswerEnum } from './entity/Attendee';
import { ListEvents } from './dto/ListEvents';

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    @InjectRepository(Event) private readonly repository: Repository<Event>,
    private readonly service: EventsService,
  ) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() filter: ListEvents) {
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
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    this.logger.log(`start: findOne(id=${id})`);
    const event = await this.service.getEvent(id);

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
    attendee.name = 'Attendee 1';
    attendee.answer = AttendeeAnswerEnum.Rejected;

    newEvent.attendees = [attendee];

    await this.repository.save(newEvent);
  }

  @Post()
  async create(@Body() data: CreateEventDTO) {
    this.logger.log(`start: create(data): ${data}`);

    const newEvent = {
      ...data,
      when: new Date(data.when),
      id: Math.floor(Date.now() / 1000),
    };

    const result = await this.repository.save(newEvent);

    this.logger.log(`end: create(data): result=${JSON.stringify(result)}`);

    return result;
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: UpdateEventDTO,
  ) {
    this.logger.log(`start: update(id=${id}`);
    let entity = await this.repository.findOneBy({ id: id });
    if (!entity) {
      this.logger.error(`Event with id=${id} not found`);
      throw new NotFoundException('Event not found');
    }
    entity = {
      ...entity,
      ...data,
      when: data.when ? new Date(data.when) : entity.when,
    };

    this.logger.debug(`The updated event data=${JSON.stringify(entity)}`);

    const result = await this.repository.save(entity);

    this.logger.log(`end: update(id): result=${JSON.stringify(result)}`);

    return result;
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseIntPipe()) id: number) {
    this.logger.log(`start: remove(id=${id})`);
    this.repository.delete(id);
    this.logger.log(`end: remove(id=${id})`);
  }
}

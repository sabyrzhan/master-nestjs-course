import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateEventDTO } from './dto/CreateEventDTO';
import { UpdateEventDTO } from './dto/UpdateEventDTO';
import { Event } from './entity/Event';
import { Between, Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('/events')
export class EventsController {
  constructor(
    @InjectRepository(Event) private readonly repository: Repository<Event>,
  ) {}

  @Get()
  findAll() {
    return this.repository.find();
  }

  @Get('/practice')
  async practice() {
    return this.repository.find({
      select: ['id', 'name'],
      where: [
        {
          id: MoreThan(3),
          when: Between(new Date('2020-01-01'), new Date('2023-02-15')),
        },
        {
          description: Like('%TRY TO SELL%'),
        },
      ],
      order: {
        description: 'asc',
      },
    });
  }

  @Get('/:id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    const event = await this.repository.findOneBy({ id: id });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  @Post()
  create(@Body() data: CreateEventDTO) {
    const newEvent: Event = {
      ...data,
      when: new Date(data.when),
      id: Math.floor(Date.now() / 1000),
    };

    return this.repository.save(newEvent);
  }

  @Patch('/:id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: UpdateEventDTO,
  ) {
    let entity = await this.repository.findOneBy({ id: id });
    if (!entity) {
      throw new NotFoundException('Event not found');
    }
    entity = {
      ...entity,
      ...data,
      when: data.when ? new Date(data.when) : entity.when,
    };

    return this.repository.save(entity);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseIntPipe()) id: number) {
    this.repository.delete(id);
  }
}

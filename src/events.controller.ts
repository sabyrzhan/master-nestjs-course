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

@Controller('/events')
export class EventsController {
  private events: Event[] = [];

  @Get()
  findAll() {
    return this.events;
  }

  @Get('/:id')
  findOne(@Param('id', new ParseIntPipe()) id: number) {
    const event = this.events.find((value) => value.id == id);

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
      id: Date.now(),
    };
    this.events.push(newEvent);

    return newEvent;
  }

  @Patch('/:id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() data: UpdateEventDTO,
  ) {
    const index = this.events.findIndex((value) => value.id === id);
    if (index < 0) {
      throw new NotFoundException('Event not found');
    }
    this.events[index] = {
      ...this.events[index],
      ...data,
      when: data.when ? new Date(data.when) : this.events[index].when,
    };

    return this.events[index];
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseIntPipe()) id: number) {
    const index = this.events.findIndex((value) => value.id === id);
    if (index < 0) {
      throw new NotFoundException('Event not found');
    }

    this.events.splice(index, 1);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendee } from '../entity/Attendee';
import { CreateAttendeeDTO } from '../dto/CreateAttendeeDTO';
import { Event } from '../entity/Event';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectRepository(Attendee)
    private readonly repository: Repository<Attendee>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  public async findByEventId(eventId: number): Promise<Attendee[]> {
    return await this.repository.find({
      where: { event: { id: eventId } },
    });
  }

  public async findOneByEventIdAndUserId(
    eventId: number,
    userId: number,
  ): Promise<Attendee | undefined> {
    return await this.repository.findOneBy({
      event: { id: eventId },
      user: { id: userId },
    });
  }

  public async createOrUpdate(
    input: CreateAttendeeDTO,
    eventId: number,
    userId: number,
  ): Promise<Attendee> {
    if ((await this.eventRepository.countBy({ id: eventId })) == 0) {
      throw new NotFoundException('Event not found');
    }
    const attendee =
      (await this.findOneByEventIdAndUserId(eventId, userId)) ?? new Attendee();

    attendee.eventId = eventId;
    attendee.userId = userId;
    attendee.answer = input.answer;

    return await this.repository.save(attendee);
  }
}

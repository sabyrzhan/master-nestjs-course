import { Repository, SelectQueryBuilder } from 'typeorm';
import { Event } from '../entity/Event';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { AttendeeAnswerEnum } from '../entity/Attendee';
import { ListEvents, WhenEventFilter } from '../dto/ListEvents';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  public async getEvent(id: number): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery().andWhere(
      'e.id = :id',
      { id },
    );

    this.logger.debug(query.getSql());

    return query.getOne();
  }

  public async getEventsWithAttendeeCountFiltered(
    filter?: ListEvents,
  ): Promise<Event[]> {
    let query = this.getEventsWithAttendeeCountQuery();
    if (!filter) {
      this.logger.debug('Filter not defined returning all');
      return query.getMany();
    }

    if (filter.when) {
      switch (+filter.when) {
        case WhenEventFilter.Today:
          this.logger.debug('Applying today filter');
          query = query.andWhere(
            `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`,
          );
          break;
        case WhenEventFilter.Tomorrow:
          this.logger.debug('Applying tomorrow filter');
          query = query.andWhere(
            `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`,
          );
          break;
        case WhenEventFilter.ThisWeek:
          this.logger.debug('Applying this week filter');
          query = query.andWhere(
            `YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)`,
          );
          break;
        case WhenEventFilter.NextWeek:
          this.logger.debug('Applying next week filter');
          query = query.andWhere(
            `YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1`,
          );
          break;
      }
    }

    this.logger.debug(`Query: ${query.getSql()}`);

    return await query.getMany();
  }

  public getEventsWithAttendeeCountQuery(): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          }),
      )
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          }),
      );
  }

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC');
  }
}

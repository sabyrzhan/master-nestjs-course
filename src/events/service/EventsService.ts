import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { Event, PaginatedEvents } from '../entity/Event';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AttendeeAnswerEnum } from '../entity/Attendee';
import { ListEvents, WhenEventFilter } from '../dto/ListEvents';
import { paginate, PaginateOptions } from '../pagination/paginator';
import { CreateEventDTO } from '../dto/CreateEventDTO';
import { User } from '../../auth/entity/User';
import { UpdateEventDTO } from '../dto/UpdateEventDTO';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  public async findOne(id: number): Promise<Event | undefined> {
    return await this.eventsRepository.findOneBy({ id });
  }

  public async getEventWithAttendeeCount(
    id: number,
  ): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery()
      .andWhere('e.id = :id', { id })
      .leftJoinAndSelect('e.organizer', 'o');

    this.logger.debug(query.getSql());

    return query.getOne();
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return await paginate(
      this.getEventsWithAttendeeCountFilteredQuery(filter),
      paginateOptions,
    );
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

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute();
  }

  public async createEvent(
    dto: CreateEventDTO,
    organizer: User,
  ): Promise<Event> {
    const newEvent = {
      ...dto,
      when: new Date(dto.when),
      organizer,
    };

    return await this.eventsRepository.save(newEvent);
  }

  public async updateEvent(
    id: number,
    dto: UpdateEventDTO,
    organizer: User,
  ): Promise<Event> {
    let entity = await this.findOne(id);
    if (!entity) {
      this.logger.error(`Event with id=${id} not found`);
      throw new NotFoundException('Event not found');
    }

    if (entity.organizer.id !== organizer.id) {
      throw new ForbiddenException(
        'You are not authorized to change this event',
      );
    }

    entity = {
      ...entity,
      ...dto,
      when: dto.when ? new Date(dto.when) : entity.when,
    };

    this.logger.debug(`The updated event data=${JSON.stringify(entity)}`);

    return await this.eventsRepository.save(entity);
  }

  public async getEventsOrganizedByUserIdPaginated(
    userId: number,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return paginate(
      this.getEventsOrganizedByUserIdQuery(userId),
      paginateOptions,
    );
  }

  public async getEventsAttendedByUserIdPaginated(
    userId: number,
    paginateOptions: PaginateOptions,
  ): Promise<PaginatedEvents> {
    return paginate(
      this.getEventsAttendedByUserIdQuery(userId),
      paginateOptions,
    );
  }

  private getEventsOrganizedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery().where('e.organiser_id = :userId', {
      userId,
    });
  }

  private getEventsAttendedByUserIdQuery(
    userId: number,
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .leftJoinAndSelect('e.attendees', 'a')
      .where('a.user_id', { userId });
  }

  private getEventsWithAttendeeCountFilteredQuery(
    filter?: ListEvents,
  ): SelectQueryBuilder<Event> {
    let query = this.getEventsWithAttendeeCountQuery();
    if (!filter) {
      this.logger.debug('Filter not defined returning all');
      return query;
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

    return query;
  }

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC');
  }
}

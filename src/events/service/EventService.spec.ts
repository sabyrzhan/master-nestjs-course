import { EventsService } from './EventsService';
import { Repository } from 'typeorm';
import { Event } from '../entity/Event';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../auth/entity/User';
import { paginate } from '../pagination/paginator';

jest.mock('../pagination/paginator');

describe('EventsService', () => {
  let service: EventsService;
  let repository: Repository<Event>;
  let selectQueryBuilder: any;
  let deleteQueryBuilder: any;
  let mockPaginate: any;

  beforeEach(async () => {
    mockPaginate = paginate as jest.Mock;
    deleteQueryBuilder = {
      where: jest.fn(),
      execute: jest.fn(),
    };
    selectQueryBuilder = {
      delete: jest.fn().mockReturnValue(deleteQueryBuilder),
      where: jest.fn(),
      execute: jest.fn(),
      orderBy: jest.fn(),
      leftJoinAndSelect: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(selectQueryBuilder),
            delete: jest.fn().mockResolvedValue(deleteQueryBuilder),
            where: jest.fn(),
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  describe('updateEvent', () => {
    it('should update event', async () => {
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(new Event({ id: 1 }));

      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(new Event({ id: 1, name: 'New name' }));

      expect(
        await service.updateEvent(
          1,
          {
            name: 'New name',
          },
          new User(),
        ),
      ).toEqual(new Event({ id: 1, name: 'New name' }));
    });
  });
  describe('deleteEvent', () => {
    it('should delete event with id', async () => {
      const createQueryBuilderSpy = jest.spyOn(
        repository,
        'createQueryBuilder',
      );
      const deleteQueryBuilderSpy = jest.spyOn(selectQueryBuilder, 'delete');
      const whereSpy = jest
        .spyOn(deleteQueryBuilder, 'where')
        .mockReturnValue(deleteQueryBuilder);
      const executeSpy = jest.spyOn(deleteQueryBuilder, 'execute');

      expect(await service.deleteEvent(1)).toBe(undefined);

      expect(createQueryBuilderSpy).toHaveBeenCalledTimes(1);
      expect(createQueryBuilderSpy).toHaveBeenCalledWith('e');
      expect(deleteQueryBuilderSpy).toHaveBeenCalled();
      expect(whereSpy).toHaveBeenCalled();
      expect(whereSpy).toHaveBeenCalledWith('id = :id', { id: 1 });
      expect(executeSpy).toHaveBeenCalled();
    });
  });
  describe('getEventsAttendedByUserIdPaginated', () => {
    it('should return list of paginated events', async () => {
      const orderBySpy = jest
        .spyOn(selectQueryBuilder, 'orderBy')
        .mockReturnValue(selectQueryBuilder);
      const leftJoinSpy = jest
        .spyOn(selectQueryBuilder, 'leftJoinAndSelect')
        .mockReturnValue(selectQueryBuilder);

      const whereSpy = jest
        .spyOn(selectQueryBuilder, 'where')
        .mockReturnValue(selectQueryBuilder);
      mockPaginate.mockResolvedValue({
        first: 1,
        last: 1,
        total: 10,
        limit: 10,
        data: [],
      });

      expect(
        await service.getEventsAttendedByUserIdPaginated(500, {
          limit: 1,
          currentPage: 1,
        }),
      ).toEqual({
        first: 1,
        last: 1,
        total: 10,
        limit: 10,
        data: [],
      });
      expect(orderBySpy).toHaveBeenCalledTimes(1);
      expect(orderBySpy).toHaveBeenCalledWith('e.id', 'DESC');
      expect(leftJoinSpy).toHaveBeenCalledTimes(1);
      expect(leftJoinSpy).toHaveBeenCalledWith('e.attendees', 'a');
      expect(whereSpy).toHaveBeenCalledTimes(1);
      expect(whereSpy).toHaveBeenCalledWith('a.userId = :userId', {
        userId: 500,
      });
      expect(mockPaginate).toHaveBeenCalledTimes(1);
      expect(mockPaginate).toHaveBeenCalledWith(selectQueryBuilder, {
        currentPage: 1,
        limit: 1,
      });
    });
  });
});

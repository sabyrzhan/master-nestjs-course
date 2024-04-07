import { EventsService } from './EventsService';
import { Repository } from 'typeorm';
import { Event } from '../entity/Event';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../auth/entity/User';

describe('EventsService', () => {
  let service: EventsService;
  let repository: Repository<Event>;
  let selectQueryBuilder: any;
  let deleteQueryBuilder: any;

  beforeEach(async () => {
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
});

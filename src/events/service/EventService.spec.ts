import { EventsService } from './EventsService';
import { Repository } from 'typeorm';
import { Event } from '../entity/Event';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../auth/entity/User';

describe('EventsService', () => {
  let service: EventsService;
  let repository: Repository<Event>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            save: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(),
            delete: jest.fn(),
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
      const repoFindOneBySpy = jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValue(new Event({ id: 1 }));

      const repoSaveSpy = jest
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
});

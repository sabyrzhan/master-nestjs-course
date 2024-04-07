import { EventsController } from './events.controller';
import { EventsService } from './service/EventsService';
import { Repository } from 'typeorm';
import { Event } from './entity/Event';
import { ListEvents } from './dto/ListEvents';
import { User } from '../auth/entity/User';
import { NotFoundException } from '@nestjs/common';

describe('EventsController', () => {
  let eventsController: EventsController;
  let eventsService: EventsService;
  let eventsRepository: Repository<Event>;

  beforeEach(() => {
    eventsService = new EventsService(eventsRepository);
    eventsController = new EventsController(eventsRepository, eventsService);
  });
  it('should return list of events', async () => {
    const result = {
      first: 1,
      last: 1,
      limit: 10,
      data: [],
    };

    // eventsService.getEventsWithAttendeeCountFilteredPaginated = jest
    //   .fn()
    //   .mockImplementation((): any => result);
    const eventServiceSpy = jest
      .spyOn(eventsService, 'getEventsWithAttendeeCountFilteredPaginated')
      .mockImplementation((): any => result);

    expect(await eventsController.findAll(new ListEvents())).toEqual(result);
    expect(eventServiceSpy).toHaveBeenCalledTimes(1);
  });

  it('should not delete an event since wont be found', async () => {
    const deleteSpy = jest.spyOn(eventsService, 'deleteEvent');
    const findSpy = jest
      .spyOn(eventsService, 'findOne')
      .mockImplementation(() => undefined);
    try {
      await eventsController.remove(1, new User());
      expect('').toEqual('Should fail');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }

    expect(findSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledTimes(0);
  });
});

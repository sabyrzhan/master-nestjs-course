import { Event } from './Event';

test('Event should be initialized through constructor', () => {
  const expected = {
    name: 'Event name',
    description: 'Event description',
  };
  const event = new Event(expected);

  expect(event).toEqual({
    ...expected,
    id: undefined,
    when: undefined,
    address: undefined,
  });
});

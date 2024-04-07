import {
  HttpStatus,
  INestApplication,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { User } from '../src/auth/entity/User';
import { AuthService } from '../src/auth/auth.service';

let app: INestApplication;
let mod: TestingModule;
let dataSource: DataSource;

const loadFixtures = async (sqlFileName: string) => {
  const sql = fs.readFileSync(
    path.join(__dirname, 'fixtures', sqlFileName),
    'utf-8',
  );
  const queryRunner = dataSource.manager.connection.createQueryRunner('master');
  for (const c of sql.split(';')) {
    if (c.trim() == '') {
      continue;
    }
    await queryRunner.query(c);
  }
};

const tokenForUser = (
  user: Partial<User> = {
    id: 1,
    username: 'testuser',
  },
): string => {
  return app.get(AuthService).getTokenForUser(user as User);
};

describe('Events (e2e)', () => {
  beforeEach(async () => {
    mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useLogger(new Logger());
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return empty list of events', async () => {
    return supertest(app.getHttpServer())
      .get('/events')
      .expect(200)
      .then((response) => {
        expect(response.body.data.length).toBe(0);
      });
  });

  it('should return a single event', async () => {
    await loadFixtures('1-event-1-user.sql');
    return supertest(app.getHttpServer())
      .get('/events/1')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          id: 1,
          name: 'Test event',
          description: 'test description',
        });
      });
  });

  it('should delete event success', async () => {
    await loadFixtures('1-event-1-user.sql');
    return supertest(app.getHttpServer())
      .delete('/events/1')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .expect(HttpStatus.NO_CONTENT);
  });

  it('should forbid deletion of non-owning event', async () => {
    await loadFixtures('1-event-2-users.sql');
    return supertest(app.getHttpServer())
      .delete('/events/1')
      .set(
        'Authorization',
        `Bearer ${tokenForUser({ id: 2, username: 'testuser2' })}`,
      )
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should fail because of user errors', async () => {
    await loadFixtures('1-user.sql');
    return supertest(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .send({ name: 'My new event' })
      .expect(HttpStatus.BAD_REQUEST)
      .then((response) => {
        expect(response.body).toMatchObject({
          statusCode: HttpStatus.BAD_REQUEST,
          message: [
            'Description length is invalid',
            'Date format is invalid',
            'Address length is invalid',
          ],
        });
      });
  });

  it('should create event', async () => {
    await loadFixtures('1-user.sql');
    const whenObj = new Date();
    whenObj.setUTCMilliseconds(0);
    const when = whenObj.toISOString();

    const requestBody = {
      name: 'My new event',
      description: 'My new event description',
      when,
      address: 'Some address 2',
    };

    return supertest(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${tokenForUser()}`)
      .send(requestBody)
      .expect(HttpStatus.CREATED)
      .then((_) =>
        supertest(app.getHttpServer())
          .get('/events/1')
          .expect(HttpStatus.OK)
          .then((response) => expect(response.body).toMatchObject(requestBody)),
      );
  });
});

import { INestApplication, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

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
describe('Events (e2e)', () => {
  beforeAll(async () => {
    mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = mod.createNestApplication();
    app.useLogger(new Logger());
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
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
});

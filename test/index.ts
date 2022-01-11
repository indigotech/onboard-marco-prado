import { setupDatabase, setupServer } from '../src/setup';
import * as request from 'supertest';

before(async () => {
  await setupDatabase();
  await setupServer(4000);
});

describe('Hello test', () => {
  it('Hello query', async () => {
    const res = await request('localhost:4000').post('/graphql').send({ query: '{hello}' });
    console.log(res.body);
  });
});

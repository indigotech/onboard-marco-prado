import { setupDatabase, setupServer } from '../src/setup';
import * as request from 'supertest';

before(async () => {
  await setupDatabase();
  try {
    await setupServer(4000);
    console.log('Server is ready at http://localhost:4000/graphql');
  } catch (err) {
    console.error('Error starting the node server', err);
  }
});

describe('Hello test', () => {
  it('Hello query', async () => {
    const res = await request('localhost:4000').post('/graphql').send({ query: '{hello}' });
    console.log(res.body);
  });
});

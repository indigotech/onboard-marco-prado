import { setupDatabase, setupServer } from '../src/setup';
import request from 'supertest';
import { expect } from 'chai';

before(async () => {
  await setupDatabase();
  await setupServer(4000);
});

describe('Hello test', () => {
  it('Hello query', async () => {
    const res = await request('localhost:4000').post('/graphql').send({ query: '{hello}' });
    expect(res.body.data.hello).to.be.eq('Hello, world!');
  });
});

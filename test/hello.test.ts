import * as request from 'supertest';
import { expect } from 'chai';

describe('hello test', () => {
  it('should return Hello, world!', async () => {
    const res = await request('localhost:4000').post('/graphql').send({ query: '{hello}' });
    expect(res.body.data.hello).to.be.eq('Hello, world!');
  });
});

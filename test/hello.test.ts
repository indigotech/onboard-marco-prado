import * as request from 'supertest';
import { expect } from 'chai';
import { makeRequest } from './index';

describe('hello test', () => {
  it('should return Hello, world!', async () => {
    const res = await makeRequest('{hello}');
    expect(res.body.data.hello).to.be.eq('Hello, world!');
  });
});

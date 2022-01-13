import { setupDatabase, setupServer } from '../src/setup';
import * as dotenv from 'dotenv';
import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';
import * as request from 'supertest';

dotenv.config({ path: __dirname + '/../test.env' });

export async function makeRequest(query: string, variables?: object, headers: object = {}) {
  const res = await request('localhost:4000')
    .post('/graphql')
    .set(headers)
    .send({ query: query, variables: variables });
  return res;
}

before(async () => {
  await setupDatabase();
  await setupServer(4000);
});

require('./hello.test');

require('./create-user.test');

require('./login.test');

require('./user.test');

afterEach(async () => {
  const userRepository = getConnection().getRepository(User);
  await userRepository.clear();
});

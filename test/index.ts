import { setupDatabase, setupServer } from '../src/setup';
import * as dotenv from 'dotenv';
import { getConnection, getRepository } from 'typeorm';
import { User } from '../src/entity/User';
import * as request from 'supertest';
import { Address } from '../src/entity/Address';

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

require('./users.test');

afterEach(async () => {
  const addressRepository = getConnection().getRepository(Address);
  const userRepository = getConnection().getRepository(User);
  await addressRepository.clear();
  await userRepository.delete({});
});

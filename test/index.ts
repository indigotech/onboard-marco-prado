import { setupDatabase, setupServer } from '../src/setup';
import * as dotenv from 'dotenv';
import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';

dotenv.config({ path: __dirname + '/../test.env' });

const createUserMutation = `
  mutation ($data: UserInput!) {
    createUser(data: $data) {
      id
      name
      email
      birthDate
    }
  }
`;

before(async () => {
  await setupDatabase();
  await setupServer(4000);
});

require('./hello.test');

require('./create-user.test');

require('./login.test');

afterEach(async () => {
  const userRepository = getConnection().getRepository(User);
  await userRepository.clear();
});

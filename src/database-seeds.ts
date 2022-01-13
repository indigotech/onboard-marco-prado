import { getConnection } from 'typeorm';
import { User } from './entity/User';
import { setupDatabase } from './setup';
import * as faker from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config();

async function generateSeeds() {
  await setupDatabase();

  const userRepository = getConnection().getRepository(User);

  for (let counter = 0; counter < 50; counter++) {
    const newUser = new User();
    newUser.name = faker.name.findName();
    newUser.email = faker.internet.email();
    newUser.password = faker.internet.password();
    newUser.birthDate = faker.date.past();

    await userRepository.insert(newUser);
  }
}

generateSeeds();

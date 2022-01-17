import { getConnection } from 'typeorm';
import { User } from './entity/User';
import { setupDatabase } from './setup';
import * as faker from '@faker-js/faker';
import * as dotenv from 'dotenv';
import { Address } from './entity/Address';

dotenv.config();

export async function generateSeeds() {
  let userList = [];
  let addressList = [];
  const userRepository = getConnection().getRepository(User);
  const addressRepository = getConnection().getRepository(Address);

  for (let counter = 0; counter < 50; counter++) {
    const newUser = new User();
    newUser.name = faker.name.findName();
    newUser.email = faker.internet.email();
    newUser.password = faker.internet.password();
    newUser.birthDate = faker.date.past();

    userList.push(newUser);
  }
  await userRepository.insert(userList);

  for (let counter = 0; counter < 50; counter++) {
    for (let secondCounter = 0; secondCounter < 2; secondCounter++) {
      const newAddress = new Address();
      newAddress.cep = faker.address.zipCode();
      newAddress.street = faker.address.streetName();
      newAddress.streetNumber = Math.floor(Math.random() * 1000);
      newAddress.complement = '-';
      newAddress.neighbourhood = faker.address.secondaryAddress();
      newAddress.city = faker.address.city();
      newAddress.state = faker.address.state();
      newAddress.userId = userList[counter].id;

      addressList.push(newAddress);
    }
  }
  await addressRepository.insert(addressList);
}

async function main() {
  await setupDatabase();
  generateSeeds();
}

main();

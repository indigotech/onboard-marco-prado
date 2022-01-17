import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';
import * as crypto from 'crypto';
import { expect } from 'chai';
import { generateSeeds } from '../src/database-seeds';
import { makeRequest } from '.';
import { generateToken } from '../src/token-manager';
import { Address } from '../src/entity/Address';

var adminToken: string;

const usersQuery = `
  query ($first: Int, $offset: Int) {
    Users(first: $first, offset: $offset) {
      total
      pageInfo {
        hasPreviousPage
        hasNextPage
      }
      users {
        user {
          id
          name
          email
          birthDate
        }
        address {
          cep
          street
          streetNumber
          complement
          neighbourhood
          city
          state
        }
      }
    }
  }
`;

beforeEach(async () => {
  const userRepository = getConnection().getRepository(User);
  const adminUser = new User();
  adminUser.name = 'Admin';
  adminUser.email = 'admin@email.com';
  adminUser.password = crypto.createHash('sha256').update('adminpswd123').digest('hex');
  adminUser.birthDate = new Date('2000-04-01');
  await userRepository.insert(adminUser);
  adminToken = generateToken(adminUser.email);
});

describe('Users test', () => {
  it('should be possible to query first users correctly', async () => {
    let dbAddresses = [];
    const userRepository = getConnection().getRepository(User);
    const addressRepository = getConnection().getRepository(Address);
    await generateSeeds();
    const dbUsers = await userRepository.createQueryBuilder('user').orderBy('user.name').limit(3).getMany();
    for (let counter = 0; counter < 3; counter++) {
      const address = await addressRepository.find({ where: { userId: dbUsers[counter].id } });
      dbAddresses.push(address);
    }

    const res = await makeRequest(
      usersQuery,
      {
        first: 3,
        offset: 0,
      },
      { Authorization: adminToken },
    );

    expect(res.body.data.Users.users[0].user).to.be.deep.eq({
      id: dbUsers[0].id.toString(),
      name: dbUsers[0].name,
      email: dbUsers[0].email,
      birthDate: dbUsers[0].birthDate.getTime().toString(),
    });
    if (dbAddresses[0] instanceof Address) {
      expect(res.body.data.Users.users[0].address[0]).to.be.deep.eq({
        cep: dbAddresses[0][0].cep,
        street: dbAddresses[0][0].street,
        streetNumber: dbAddresses[0][0].streetNumber,
        complement: '-',
        neighbourhood: dbAddresses[0][0].neighbourhood,
        city: dbAddresses[0][0].city,
        state: dbAddresses[0][0].state,
      });
      expect(res.body.data.Users.users[0].address[1]).to.be.deep.eq({
        cep: dbAddresses[0][1].cep,
        street: dbAddresses[0][1].street,
        streetNumber: dbAddresses[0][1].streetNumber,
        complement: '-',
        neighbourhood: dbAddresses[0][1].neighbourhood,
        city: dbAddresses[0][1].city,
        state: dbAddresses[0][1].state,
      });
    }
    expect(res.body.data.Users.users[1].user).to.be.deep.eq({
      id: dbUsers[1].id.toString(),
      name: dbUsers[1].name,
      email: dbUsers[1].email,
      birthDate: dbUsers[1].birthDate.getTime().toString(),
    });
    if (dbAddresses[1] instanceof Address) {
      expect(res.body.data.Users.users[1].address[0]).to.be.deep.eq({
        cep: dbAddresses[1][0].cep,
        street: dbAddresses[1][0].street,
        streetNumber: dbAddresses[1][0].streetNumber,
        complement: '-',
        neighbourhood: dbAddresses[1][0].neighbourhood,
        city: dbAddresses[1][0].city,
        state: dbAddresses[1][0].state,
      });
      expect(res.body.data.Users.users[1].address[1]).to.be.deep.eq({
        cep: dbAddresses[1][1].cep,
        street: dbAddresses[1][1].street,
        streetNumber: dbAddresses[1][1].streetNumber,
        complement: '-',
        neighbourhood: dbAddresses[1][1].neighbourhood,
        city: dbAddresses[1][1].city,
        state: dbAddresses[1][1].state,
      });
    }
    expect(res.body.data.Users.users[2].user).to.be.deep.eq({
      id: dbUsers[2].id.toString(),
      name: dbUsers[2].name,
      email: dbUsers[2].email,
      birthDate: dbUsers[2].birthDate.getTime().toString(),
    });
    if (dbAddresses[2] instanceof Address) {
      expect(res.body.data.Users.users[2].address[0]).to.be.deep.eq({
        cep: dbAddresses[2][0].cep,
        street: dbAddresses[2][0].street,
        streetNumber: dbAddresses[2][0].streetNumber,
        complement: '-',
        neighbourhood: dbAddresses[2][0].neighbourhood,
        city: dbAddresses[2][0].city,
        state: dbAddresses[2][0].state,
      });
      expect(res.body.data.Users.users[2].address[1]).to.be.deep.eq({
        cep: dbAddresses[2][1].cep,
        street: dbAddresses[2][1].street,
        streetNumber: dbAddresses[2][1].streetNumber,
        complement: '-',
        neighbourhood: dbAddresses[2][1].neighbourhood,
        city: dbAddresses[2][1].city,
        state: dbAddresses[2][1].state,
      });
    }
    expect(res.body.data.Users.pageInfo.hasNextPage).to.be.eq(true);
    expect(res.body.data.Users.pageInfo.hasPreviousPage).to.be.eq(false);
  });

  it("should indicate that there's no next page", async () => {
    await generateSeeds();

    const res = await makeRequest(
      usersQuery,
      {
        first: 10,
        offset: 45,
      },
      { Authorization: adminToken },
    );
    
    expect(res.body.data.Users.pageInfo.hasNextPage).to.be.eq(false);
    expect(res.body.data.Users.pageInfo.hasPreviousPage).to.be.eq(true);
  });

  it("should indicate that there's no previous page", async () => {
    await generateSeeds();

    const res = await makeRequest(
      usersQuery,
      {
        first: 10,
        offset: 0,
      },
      { Authorization: adminToken },
    );

    expect(res.body.data.Users.pageInfo.hasNextPage).to.be.eq(true);
    expect(res.body.data.Users.pageInfo.hasPreviousPage).to.be.eq(false);
  });

  it("should indicate that there's both previous and next pages", async () => {
    await generateSeeds();

    const res = await makeRequest(
      usersQuery,
      {
        first: 10,
        offset: 15,
      },
      { Authorization: adminToken },
    );

    expect(res.body.data.Users.pageInfo.hasNextPage).to.be.eq(true);
    expect(res.body.data.Users.pageInfo.hasPreviousPage).to.be.eq(true);
  });

  it('should return invalid token error (no token sent)', async () => {
    const res = await makeRequest(usersQuery, {
      first: 1,
      offset: 0,
    });

    expect(res.body.errors[0].code).to.be.eq(401);
    expect(res.body.errors[0].message).to.be.eq('Invalid token!');
  });

  it('should return invalid token error (invalid token sent)', async () => {
    const res = await makeRequest(
      usersQuery,
      {
        first: 1,
        offset: 0,
      },
      { Authorization: 'invalidToken' },
    );

    expect(res.body.errors[0].code).to.be.eq(401);
    expect(res.body.errors[0].message).to.be.eq('Invalid token!');
  });
});

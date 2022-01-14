import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';
import * as crypto from 'crypto';
import { expect } from 'chai';
import { generateSeeds } from '../src/database-seeds';
import { makeRequest } from '.';
import { generateToken } from '../src/token-manager';

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
        id
        name
        email
        birthDate
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
    const userRepository = getConnection().getRepository(User);
    await generateSeeds();
    const dbUsers = await userRepository.createQueryBuilder('user').orderBy('user.name').limit(3).getMany();

    const res = await makeRequest(
      usersQuery,
      {
        first: 3,
        offset: 0,
      },
      { Authorization: adminToken },
    );

    expect(res.body.data.Users.users[0]).to.be.deep.eq({
      id: dbUsers[0].id.toString(),
      name: dbUsers[0].name,
      email: dbUsers[0].email,
      birthDate: dbUsers[0].birthDate.getTime().toString(),
    });
    expect(res.body.data.Users.users[1]).to.be.deep.eq({
      id: dbUsers[1].id.toString(),
      name: dbUsers[1].name,
      email: dbUsers[1].email,
      birthDate: dbUsers[1].birthDate.getTime().toString(),
    });
    expect(res.body.data.Users.users[2]).to.be.deep.eq({
      id: dbUsers[2].id.toString(),
      name: dbUsers[2].name,
      email: dbUsers[2].email,
      birthDate: dbUsers[2].birthDate.getTime().toString(),
    });
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

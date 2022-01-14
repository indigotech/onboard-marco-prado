import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';
import * as crypto from 'crypto';
import * as request from 'supertest';
import { expect } from 'chai';
import * as jwt from 'jsonwebtoken';
import { generateSeeds } from '../src/database-seeds';

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
  adminToken = jwt.sign({ email: adminUser.email }, 'tokensecret', { expiresIn: 120 });
});

describe('Users test', () => {
  it('should be possible to query first users correctly', async () => {
    await generateSeeds();

    const res = await request('localhost:4000')
      .post('/graphql')
      .set('Authorization', adminToken)
      .send({
        query: usersQuery,
        variables: {
          first: 3,
          offset: 0,
        },
      });

    expect(res.body.data.Users.users).to.have.lengthOf(3);
    expect(res.body.data.Users.pageInfo.hasNextPage).to.be.eq(true);
    expect(res.body.data.Users.pageInfo.hasPreviousPage).to.be.eq(false);
  });

  it("should indicate that there's no next page", async () => {
    await generateSeeds();

    const res = await request('localhost:4000')
      .post('/graphql')
      .set('Authorization', adminToken)
      .send({
        query: usersQuery,
        variables: {
          first: 10,
          offset: 45,
        },
      });

    expect(res.body.data.Users.pageInfo.hasNextPage).to.be.eq(false);
    expect(res.body.data.Users.pageInfo.hasPreviousPage).to.be.eq(true);
  });

  it('should return invalid token error (no token sent)', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
      .send({
        query: usersQuery,
        variables: {
          first: 1,
          offset: 0,
        },
      });

    expect(res.body.errors[0].code).to.be.eq(401);
    expect(res.body.errors[0].message).to.be.eq('Invalid token!');
  });

  it('should return invalid token error (invalid token sent)', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
      .set('Authorization', 'invalidToken')
      .send({
        query: usersQuery,
        variables: {
          first: 1,
          offset: 0,
        },
      });

    expect(res.body.errors[0].code).to.be.eq(401);
    expect(res.body.errors[0].message).to.be.eq('Invalid token!');
  });
});

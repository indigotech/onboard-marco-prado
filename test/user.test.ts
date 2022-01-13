import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';
import * as crypto from 'crypto';
import * as request from 'supertest';
import { expect } from 'chai';
import { gql } from 'apollo-server-express';

var adminToken: string;
const loginMutation = `
  mutation ($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        name
        email
        birthDate
      }
      token
    }
  }
`;

const userQuery = `
  query ($id: ID!) {
    user(id: $id) {
      id
      name
      email
      birthDate
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
  const res = await request('localhost:4000')
    .post('/graphql')
    .send({ query: loginMutation, variables: { email: 'admin@email.com', password: 'adminpswd123' } });
  adminToken = res.body.data.login.token;
});

describe('user test', () => {
  it('should be possible to query user correctly', async () => {
    const userRepository = getConnection().getRepository(User);
    const testUser = new User();
    testUser.name = 'Marco';
    testUser.email = 'marco@email.com';
    testUser.password = crypto.createHash('sha256').update('pswd123').digest('hex');
    testUser.birthDate = new Date('2000-04-01');
    await userRepository.insert(testUser);

    const res = await request('localhost:4000')
      .post('/graphql')
      .set('Authorization', adminToken)
      .send({
        query: userQuery,
        variables: {
          id: testUser.id,
        },
      });

    expect(res.body.data.user.name).to.be.eq('Marco');
    expect(res.body.data.user.email).to.be.eq('marco@email.com');
  });

  it('should return user not found error', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
      .set('Authorization', adminToken)
      .send({
        query: userQuery,
        variables: {
          id: -1,
        },
      });

    expect(res.body.errors[0].code).to.be.eq(404);
    expect(res.body.errors[0].message).to.be.eq('User not found!');
  });

  it('should return invalid token error (no token sent)', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
      .send({
        query: userQuery,
        variables: {
          id: 1,
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
        query: userQuery,
        variables: {
          id: 1,
        },
      });

    expect(res.body.errors[0].code).to.be.eq(401);
    expect(res.body.errors[0].message).to.be.eq('Invalid token!');
  });
});

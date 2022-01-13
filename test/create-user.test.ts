import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';
import * as crypto from 'crypto';
import * as request from 'supertest';
import { expect } from 'chai';

var adminToken: string;
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

const loginMutation = `
mutation ($email: String!, $password: String!){
  login(email: $email, password: $password){
    user{
      id
      name
      email
      birthDate
    }
    token
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

describe('createUser test', () => {
  it('should be possible to create user correctly', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
      .set('Authorization', adminToken)
      .send({
        query: createUserMutation,
        variables: {
          data: {
            name: 'Marco',
            email: 'marco@email.com',
            password: 'pswd123',
            birthDate: '04-01-2000',
          },
        },
      });

    expect(res.body.data.createUser.id).to.exist;
    expect(res.body.data.createUser.name).to.be.eq('Marco');
    expect(res.body.data.createUser.email).to.be.eq('marco@email.com');
    expect(res.body.data.createUser.birthDate).to.be.eq('954558000000');

    const userRepository = getConnection().getRepository(User);
    const dbUser = await userRepository.findOne(res.body.data.createUser.id);
    expect(dbUser.name).to.be.eq('Marco');
    expect(dbUser.email).to.be.eq('marco@email.com');
    expect(dbUser.birthDate.toDateString()).to.be.eq(new Date('2000-04-01T03:00:00.000Z').toDateString());
    expect(dbUser.password).to.be.eq(crypto.createHash('sha256').update('pswd123').digest('hex'));
  });

  it('should return e-mail already being used error', async () => {
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
        query: createUserMutation,
        variables: {
          data: {
            name: 'Marco',
            email: 'marco@email.com',
            password: 'pswd12345',
            birthDate: '05-01-2000',
          },
        },
      });

    expect(res.body.errors[0].code).to.be.eq(400);
    expect(res.body.errors[0].message).to.be.eq('This e-mail is already being used!');
  });

  it('should return weak password error', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
      .set('Authorization', adminToken)
      .send({
        query: createUserMutation,
        variables: {
          data: {
            name: 'Carlos',
            email: 'carlos@email.com',
            password: 'pswd',
            birthDate: '04-01-2000',
          },
        },
      });

    expect(res.body.errors[0].code).to.be.eq(400);
    expect(res.body.errors[0].message).to.be.eq('Weak password!');
  });

  it('should return invalid token error (no token sent)', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
      .send({
        query: createUserMutation,
        variables: {
          data: {
            name: 'Carlos',
            email: 'carlos@email.com',
            password: 'pswd',
            birthDate: '04-01-2000',
          },
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
        query: createUserMutation,
        variables: {
          data: {
            name: 'Carlos',
            email: 'carlos@email.com',
            password: 'pswd',
            birthDate: '04-01-2000',
          },
        },
      });

    expect(res.body.errors[0].code).to.be.eq(401);
    expect(res.body.errors[0].message).to.be.eq('Invalid token!');
  });
});

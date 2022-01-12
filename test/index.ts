import { setupDatabase, setupServer } from '../src/setup';
import * as request from 'supertest';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';
import * as crypto from 'crypto';

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

describe('hello test', () => {
  it('should return Hello, world!', async () => {
    const res = await request('localhost:4000').post('/graphql').send({ query: '{hello}' });
    expect(res.body.data.hello).to.be.eq('Hello, world!');
  });
});

describe('createUser test', () => {
  it('should be possible to create user correctly', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
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
    let res = await request('localhost:4000')
      .post('/graphql')
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

    res = await request('localhost:4000')
      .post('/graphql')
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
});

afterEach(async () => {
  const userRepository = getConnection().getRepository(User);
  await userRepository.clear();
});

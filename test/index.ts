import { setupDatabase, setupServer } from '../src/setup';
import * as request from 'supertest';
import { expect } from 'chai';
import * as dotenv from 'dotenv';
import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';

dotenv.config({ path: __dirname + '/../test.env' });

before(async () => {
  await setupDatabase();
  await setupServer(4000);
});

describe('Hello test', () => {
  it('Hello query', async () => {
    const res = await request('localhost:4000').post('/graphql').send({ query: '{hello}' });
    expect(res.body.data.hello).to.be.eq('Hello, world!');
  });
});

describe('createUser test', () => {
  it('createUser mutation', async () => {
    const res = await request('localhost:4000')
      .post('/graphql')
      .send({
        query: `
        mutation {
          createUser(
            data: { name: "Marco", email: "marco@email.com", password: "pswd123", birthDate: "04-01-2000" }
          ) {
            id
            name
            email
            birthDate
          }
        }
      `,
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
    expect(dbUser.password).to.not.be.eq('pswd123');
  });
});

afterEach(async () => {
  const userRepository = getConnection().getRepository('User');
  await userRepository.clear();
});

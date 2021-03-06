import { getConnection } from 'typeorm';
import { User } from '../src/entity/User';
import * as crypto from 'crypto';
import { expect } from 'chai';
import * as jwt from 'jsonwebtoken';
import { makeRequest } from './index';

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

describe('login test', () => {
  it('should be possible to login correctly', async () => {
    const userRepository = getConnection().getRepository(User);
    const testUser = new User();
    testUser.name = 'Marco';
    testUser.email = 'marco@email.com';
    testUser.password = crypto.createHash('sha256').update('pswd123').digest('hex');
    testUser.birthDate = new Date('2000-04-01');
    await userRepository.insert(testUser);

    const res = await makeRequest(loginMutation, { email: 'marco@email.com', password: 'pswd123' });

    expect(res.body.data.login.user.email).to.be.eq('marco@email.com');
    expect(jwt.verify(res.body.data.login.token, 'tokensecret')).to.exist;
    expect((<any>jwt.decode(res.body.data.login.token)).email).to.be.eq('marco@email.com');
  });

  it('should return user not found error', async () => {
    const res = await makeRequest(loginMutation, { email: 'marco@email.com', password: 'pswd123' });

    expect(res.body.errors[0].code).to.be.eq(401);
    expect(res.body.errors[0].message).to.be.eq('User not found!');
  });

  it('should return invalid password error', async () => {
    const userRepository = getConnection().getRepository(User);
    const testUser = new User();
    testUser.name = 'Marco';
    testUser.email = 'marco@email.com';
    testUser.password = crypto.createHash('sha256').update('pswd123').digest('hex');
    testUser.birthDate = new Date('2000-04-01');
    await userRepository.insert(testUser);

    const res = await makeRequest(loginMutation, { email: 'marco@email.com', password: 'pswd12345' });

    expect(res.body.errors[0].code).to.be.eq(401);
    expect(res.body.errors[0].message).to.be.eq('Invalid password!');
  });
});

import 'reflect-metadata';
import { getConnection } from 'typeorm';
import * as crypto from 'crypto';
import { UserInput } from './UserInput';
import { User } from './entity/User';

export const resolvers = {
  Query: {
    hello() {
      return 'Hello, world!';
    },
  },
  Mutation: {
    createUser: async (_: undefined, args: UserInput) => {
      const user = new User();
      const userRepository = getConnection().getRepository(User);

      user.name = args.data.name;
      user.email = args.data.email;
      user.password = crypto.createHash('sha256').update(args.data.password).digest('hex');
      user.birthDate = new Date(args.data.birthDate);

      if (args.data.password.length < 6 || !/\d/.test(args.data.password) || !/[A-Za-z]/.test(args.data.password)) {
        throw new Error('Weak password!');
      }
      const countUsers = await userRepository.count({ email: user.email });

      if (countUsers > 0) {
        throw new Error('This e-mail is already being used!');
      }

      await userRepository.insert(user);
      return user;
    },
  },
};

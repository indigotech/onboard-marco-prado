import 'reflect-metadata';
import { getConnection } from 'typeorm';
import * as crypto from 'crypto';
import { UserInput } from './UserInput';
import { User } from './entity/User';
import { CustomError } from './error-formatter';

export const resolvers = {
  Query: {
    hello() {
      return 'Hello, world!';
    },
  },
  Mutation: {
    createUser: async (_: any, args: UserInput) => {
      const user = new User();
      const userRepository = getConnection().getRepository(User);

      user.name = args.data.name;
      user.email = args.data.email;
      user.password = crypto.createHash('sha256').update(args.data.password).digest('hex');
      user.birthDate = new Date(args.data.birthDate);

      if (args.data.password.length < 6 || !/\d/.test(args.data.password) || !/[A-Za-z]/.test(args.data.password)) {
        throw new CustomError('Weak password!', 400);
      }
      const countUsers = await userRepository.count({ email: user.email });

      if (countUsers > 0) {
        throw new CustomError('This e-mail is already being used!', 400);
      }

      await userRepository.insert(user);
      return user;
    },
    login: async (_: any, args: any) => {
      const userRepository = getConnection().getRepository(User);
      const loginUser = await userRepository.findOne({
        where: { email: args.email },
      });

      if (loginUser === undefined) {
        throw new CustomError('User not found!', 401);
      }

      if (loginUser.password === crypto.createHash('sha256').update(args.password).digest('hex')) {
        return {
          user: loginUser,
          token: 'teste',
        };
      } else {
        throw new CustomError('Invalid password!', 401);
      }
    },
  },
};

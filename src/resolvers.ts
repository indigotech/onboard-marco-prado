import 'reflect-metadata';
import { getConnection } from 'typeorm';
import * as crypto from 'crypto';
import { UserInput } from './UserInput';
import { User } from './entity/User';
import { CustomError } from './error-formatter';
import { generateToken, verifyToken } from './token-manager';
import { ReqHeader } from './context';
import { Address } from './entity/Address';

export const resolvers = {
  Query: {
    hello() {
      return 'Hello, world!';
    },
    async user(_: any, args: any, context: ReqHeader) {
      const userRepository = getConnection().getRepository(User);
      const addressRepository = getConnection().getRepository(Address);
      const reqToken: string = context.headers.authorization;
      verifyToken(reqToken, 'tokensecret');
      const user = await userRepository.findOne(args.id);
      if (!user) {
        throw new CustomError('User not found!', 404);
      }
      const addressList = await addressRepository.find({ where: { userId: user.id } });
      return { user: user, address: addressList };
    },
    async Users(_: any, args: any, context: ReqHeader) {
      const userRepository = getConnection().getRepository(User);
      const addressRepository = getConnection().getRepository(Address);
      const reqToken: string = context.headers.authorization;
      let hasPreviousPage = false;
      let hasNextPage = false;
      let userList = [];
      const userCount = await userRepository.count();
      verifyToken(reqToken, 'tokensecret');

      if (args.offset > 0) {
        hasPreviousPage = true;
      }
      if (args.first + args.offset < userCount) {
        hasNextPage = true;
      }
      const users = await userRepository
        .createQueryBuilder('user')
        .orderBy('user.name')
        .offset(args.offset)
        .limit(args.first)
        .getMany();

      for (let counter = 0; counter < users.length; counter++) {
        const address = await addressRepository.find({ where: { userId: users[counter].id } });
        userList.push({ user: users[counter], address: address });
      }

      return {
        total: userCount,
        pageInfo: { hasPreviousPage: hasPreviousPage, hasNextPage: hasNextPage },
        users: userList,
      };
    },
  },
  Mutation: {
    createUser: async (_: any, args: UserInput, context: ReqHeader) => {
      const user = new User();
      const userRepository = getConnection().getRepository(User);
      const reqToken: string = context.headers.authorization;
      verifyToken(reqToken, 'tokensecret');
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

      if (!loginUser) {
        throw new CustomError('User not found!', 401);
      }

      if (loginUser.password === crypto.createHash('sha256').update(args.password).digest('hex')) {
        return {
          user: loginUser,
          token: generateToken(args.email, args.rememberMe),
        };
      } else {
        throw new CustomError('Invalid password!', 401);
      }
    },
  },
};

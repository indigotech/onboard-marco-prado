import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import * as express from 'express';
import * as http from 'http';
import { createConnection, getConnection } from 'typeorm';
import { User } from './entity/User';
import * as fs from 'fs';
import * as path from 'path';
import { UserInput } from './UserInput';

//database setup
async function setupDatabase() {
  await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'local-admin',
    password: 'localpswd',
    database: 'local-db',
    synchronize: true,
    logging: false,
    entities: [User],
  });
}

//graphql server
const resolvers = {
  Query: {
    hello() {
      return "Hello, world!";
    },
  },
  Mutation: {
    createUser: async (_: undefined, args: UserInput) => {
      const user = new User();
      const userRepository = getConnection().getRepository(User);
      user.name = args.data.name;
      user.email = args.data.email;
      user.password = args.data.password;
      user.birthDate = new Date(args.data.birthDate);

      if (user.password.length < 6 || !/\d/.test(user.password) || !/[A-Za-z]/.test(user.password)) {
        throw new Error('Weak password!');
      }
      const countUsers = await userRepository.count({ email: user.email });

      if (countUsers > 0) {
        throw new Error('This e-mail is already being used!');
      }
      
      await userRepository.insert(user);
      return user;
    },
  }
};

async function listen(port: number) {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'),
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  server.applyMiddleware({ app });

  httpServer.listen(port);
}

async function main() {
  await setupDatabase();
  try {
    await listen(4000);
    console.log("Server is ready at http://localhost:4000/graphql");
  } catch (err) {
    console.error("Error starting the node server", err);
  }
}

main();

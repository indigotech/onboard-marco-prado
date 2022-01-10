import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import * as express from 'express';
import * as http from 'http';
import { createConnection } from 'typeorm';
import { User } from './entity/User';
import * as fs from 'fs';
import * as path from 'path';
import { UserInput } from './UserInput';

async function setupDatabase() {
  createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'local-admin',
    password: 'localpswd',
    database: 'local-db',
    synchronize: true,
    logging: false,
    entities: [User],
  })
    .then(async (connection) => {
      const user = new User();
      user.name = 'Marco';
      user.email = 'marco.prado@taqtile.com.br';
      user.password = 'pswd';
      user.birthDate = new Date('04-01-2000');

      await connection.manager.save(user);
      console.log('User saved. User id: ', user.id);
    })
    .catch((error) => console.log(error));
}

const resolvers = {
  Query: {
    hello() {
      return "Hello, world!";
    },
  },
  Mutation: {
    createUser: (_: undefined, args: UserInput) => {
      const newUser = {
        id: 1,
        name: args.data.name,
        email: args.data.email,
        password: args.data.password,
        birthDate: args.data.birthDate,
      };
      return newUser;
    },
  },
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

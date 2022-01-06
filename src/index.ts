import 'reflect-metadata';
import { ApolloServer, gql } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express from 'express';
import * as http from 'http';
import { createConnection } from 'typeorm';
import { User } from './entity/User';

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

    await connection.manager.save(user);
    console.log('User saved. User id: ', user.id);
  })
  .catch((error) => console.log(error));

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello() {
      return "Hello, world!";
    },
  },
};

async function listen(port: number) {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  server.applyMiddleware({ app });

  await httpServer.listen(port);
}

async function main() {
  try {
    await listen(4000);
    console.log("Server is ready at http://localhost:4000/graphql");
  } catch (err) {
    console.error("Error starting the node server", err);
  }
}

main();

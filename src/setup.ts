import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import * as express from 'express';
import * as http from 'http';
import { createConnection } from 'typeorm';
import { User } from './entity/User';
import * as fs from 'fs';
import * as path from 'path';
import { resolvers } from './resolvers';
import { formatError } from './error-formatter';

export async function setupDatabase() {
  await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [User],
  });
}

export async function setupServer(port: number) {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs: fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8'),
    resolvers,
    context: ({ req }) => {
      return req;
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError,
  });
  await server.start();

  server.applyMiddleware({ app });

  httpServer.listen(port);
}

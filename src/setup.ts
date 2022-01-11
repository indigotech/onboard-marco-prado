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

export async function setupDatabase() {
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

export async function setupServer(port: number) {
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

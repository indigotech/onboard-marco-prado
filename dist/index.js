var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import apolloExpress from 'apollo-server-express';
import apolloCore from 'apollo-server-core';
import express from 'express';
import http from 'http';
const { ApolloServer, gql } = apolloExpress;
const { ApolloServerPluginDrainHttpServer } = apolloCore;
const typeDefs = gql `
  type Query {
    hello: String
  }
`;
const resolvers = {
    Query: {
        hello() {
            return 'Hello, world!';
        },
    },
};
function listen(port) {
    return __awaiter(this, void 0, void 0, function* () {
        const app = express();
        const httpServer = http.createServer(app);
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        });
        yield server.start();
        server.applyMiddleware({ app });
        return new Promise((resolve, reject) => {
            httpServer.listen(port).once('listening', resolve).once('error', reject);
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield listen(4000);
            console.log('Server is ready at http://localhost:4000/graphql');
        }
        catch (err) {
            console.error('Error starting the node server', err);
        }
    });
}
void main();

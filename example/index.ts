import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import fs from 'fs';
import resolvers from './resolvers';

const app = express();

const typeDefs = gql`
	${fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')}
`;

const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({ app, cors: false });

const port = 4001;

app.listen({ port: port }, () =>
	console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
);

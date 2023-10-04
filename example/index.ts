import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import fs from 'fs';
import resolvers from './src/resolvers';

const app = express();

const typeDefs = gql`
	${fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')}
`;

const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
	await server.start();
	server.applyMiddleware({ app, cors: false });

  }
  
startServer().catch(err => console.error(err));

const port = 4001;

app.listen({ port: port }, () =>
	console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`),
	console.log('Use postman to test the API')
);

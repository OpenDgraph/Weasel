import express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import resolvers from './src/resolvers/index.ts';
import schemaDefinition from './src/schema/schemaAST.ts';

const defs = schemaDefinition();
const app = express();

const typeDefs = gql`
	${defs[0]}
`;

const _resolvers = resolvers(defs[1])[0];

const server = new ApolloServer({ typeDefs, resolvers: _resolvers });

export async function startServer() {
	await server.start();
	server.applyMiddleware({ app, cors: false });
	const port = 4001;

	app.listen(port, () => {
		console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`),
			console.log('Use postman to test the API');
	});
}

// TODO: Fix this later
// startServer().catch(err => console.error(err));

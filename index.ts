import express from 'express';
import fs from 'fs';
import { buildSchema } from 'graphql';
import { ApolloServer, gql } from 'apollo-server-express';

import resolvers from './src/resolvers/index.ts';
import schemaDefinition from './src/schema/schemaAST.ts';
import schemaStore from './src/stores/schemaStore.ts';

import http from 'http';

let apolloServer: any;
let httpServer: any;

const app = express();
app.use(express.json());

app.post('/update-schema', async (req, res) => {
	let newSchemaString = req.body.schema;

	if (!newSchemaString) {
		return res.status(400).send('No Schema provided');
	}
	try {
		buildSchema(newSchemaString);
	} catch (error) {
		console.error('Invalid schema:', error);
		return res.status(400).send(`Invalid schema: ${error}`);
	}
	if (
		process.env.RUNNING_JEST === 'true' ||
		process.env.NODE_ENV === 'test' ||
		process.env.NODE_ENV === 'debug'
	) {
		newSchemaString = fs.readFileSync(__dirname.concat('/src/schema/schema.graphql'), 'utf8');
	}
	httpServer?.close();
	httpServer.removeAllListeners('request');

	await schemaStore.setState({ state: newSchemaString });

	await startServer();

	res.send({ status: 'success' });
});

async function startServer() {
	const app2 = express();

	const defs = await schemaDefinition();
	const typeDefs = gql`
		${defs[0]}
	`;
	const _resolvers = resolvers(defs[1])[0];

	apolloServer = new ApolloServer({ typeDefs, resolvers: _resolvers });
	await apolloServer.start();

	apolloServer.applyMiddleware({ app: app2, cors: false, path: '/graphql' });

	httpServer = http.createServer(app2);
	httpServer.listen(4004, () => {
		console.log(`🚀 Server ready at http://localhost:4004${apolloServer.graphqlPath}`);
	});
}

const port = 4001;
app.listen(port, () => {
	console.log(`🚀 Server ready at http://localhost:${port}`),
	console.log('Use postman to test the API');
});

startServer().catch(err => console.error(err));

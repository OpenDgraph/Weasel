import express from 'express';
import fs from 'fs';
import { buildSchema } from 'graphql';
import { ApolloServer, gql } from 'apollo-server-express';

import resolvers from './src/resolvers/index.ts';
import schemaDefinition from './src/schema/schemaAST.ts';
import schemaStore from './src/stores/schemaStore.ts';

let server: any;

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
		newSchemaString = fs.readFileSync(
			__dirname.concat('/src/schema/schema.graphql'),
			'utf8'
		);
	}

	await schemaStore.setState({ state: newSchemaString });

	// TODO: This is not working
	// the issue is that I don't know how to reload the schema
	// if (server) {
	// 	await server.stop();
	// 	server = null;
	// }

	try {
		server = await startServer();
	} catch (error) {
		console.error('Failed to restart the server', error);
		return res.status(500).send('Failed to restart the server');
	}

	res.send({ status: 'success' });
});

async function startServer() {
	const defs = await schemaDefinition();
	const typeDefs = gql`
		${defs[0]}
	`;
	const _resolvers = resolvers(defs[1])[0];

	server = new ApolloServer({ typeDefs, resolvers: _resolvers });
	await server.start();
	server.applyMiddleware({ app, cors: false });

	return server;
}

const port = 4001;
app.listen(port, () => {
	console.log(`🚀 Server ready at http://localhost:${port}`),
		console.log('Use postman to test the API');
});

startServer().catch(err => console.error(err));

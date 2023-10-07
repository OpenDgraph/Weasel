import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
	uri: 'http://localhost:4001/graphql',
	cache: new InMemoryCache()
});

describe('Queries', () => {
	it('should queryUsers', async () => {
		const { data } = await client.query({
			query: gql`
				{
					query {
						queryUsers {
							id
							title
						}
					}
				}
			`
		});

		expect(data).toHaveProperty('query');
		expect(data.query).toHaveProperty('queryUsers');
		expect(Array.isArray(data.query.queryUsers)).toBe(true);
		expect(data.query.queryUsers[0]).toHaveProperty('id');
		expect(data.query.queryUsers[0]).toHaveProperty('title');
	});
});

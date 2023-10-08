import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

let uri: string;

if (process.env.RUNNING_JEST === 'true' || process.env.NODE_ENV === 'test') {
	uri = 'http://app:4001/graphql';
} else {
	uri = 'http://localhost:4001/graphql';
}

const client = new ApolloClient({
	uri: uri,
	cache: new InMemoryCache()
});

describe('Mutations', () => {
	it('should add User', async () => {
		const { data } = await client.mutate({
			mutation: gql`
				mutation MT1 {
					add {
						addUser(input: { title: "teste michel 2" }) {
							title
							id
						}
					}
				}
			`
		});

		expect(data).toHaveProperty('add');
		expect(data.add).toHaveProperty('addUser');
		expect(data.add.addUser).toEqual(expect.any(Object));
		expect(data.add.addUser).toHaveProperty('id');
		expect(data.add.addUser).toHaveProperty('titleMAKEITFAIL');
	}, 3000);
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
	}, 3000);
	it('should getUser', async () => {
		const { data } = await client.query({
			query: gql`
				{
					getQuery {
						getUser(id: "0x1") {
							id
							title
						}
					}
					test: getQuery {
						getUser(id: "0x2") {
							id
							title
						}
					}
				}
			`
		});

		expect(data).toHaveProperty('getQuery');
		expect(data.getQuery).toHaveProperty('getUser');
		expect(data.getQuery.getUser).toEqual(expect.any(Object));
		expect(data.getQuery.getUser).toHaveProperty('id');
		expect(data.getQuery.getUser).toHaveProperty('title');
	}, 3000);
});

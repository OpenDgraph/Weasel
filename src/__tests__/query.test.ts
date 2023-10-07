import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
	uri: 'http://localhost:4001/graphql',
	cache: new InMemoryCache()
});

// beforeAll(async () => {
//     await sleep(30000);
// }, 30000);
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
		expect(data.add.addUser).toHaveProperty('title');
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
});

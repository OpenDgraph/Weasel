import { DgraphManager } from '../DgraphManager';
import { generateQueryResolver } from './queryResolvers';
import { generateMutationResolver } from './mutationResolvers';

const dgraphManager = new DgraphManager();

// const dgraphManager = new DgraphManager('http://some-address:8080');

export const doQuery = dgraphManager.doQuery.bind(dgraphManager);
export const doMutation = dgraphManager.doMutation.bind(dgraphManager);
export const doUpsert = dgraphManager.doUpsert.bind(dgraphManager);

const resolvers = (fields: any): any[] => {
	const queryFields = fields[0];
	const mutationFields = fields[1];

	const RootQuery: any = {
		query: (parent: any, args: any, context: any, resolveInfo: any) => {
			const queryResolvers: any = {};
			for (const fieldName of queryFields) {
				queryResolvers[fieldName] = generateQueryResolver(fieldName);
			}
			return queryResolvers;
		}
	};

	const RootMutation: any = {
		mutation: (parent: any, args: any, context: any, resolveInfo: any) => {
			const mutationResolvers: any = {};
			for (const fieldName of mutationFields) {
				mutationResolvers[fieldName] = generateMutationResolver(fieldName);
			}
			return mutationResolvers;
		}
	};

	return [
		{
			RootQuery,
			RootMutation
		}
	];
};

export default resolvers;

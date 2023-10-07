import { generateQueryResolver } from './queryResolvers';
import { generateMutationResolver } from './mutationResolvers';

const resolvers = (fields: any): any[] => {
	const queryFields = fields[0];
	const mutationFields = fields[1];

	const RootQuery: any = {
		getQuery: (parent: any, args: any, context: any, resolveInfo: any) => {
			const queryResolvers: any = {};
			for (const fieldName of queryFields) {
				queryResolvers[fieldName] = generateQueryResolver(fieldName);
			}
			return queryResolvers;
		},
		query: (parent: any, args: any, context: any, resolveInfo: any) => {
			const queryResolvers: any = {};
			for (const fieldName of queryFields) {
				queryResolvers[fieldName] = generateQueryResolver(fieldName);
			}
			return queryResolvers;
		}
	};

	const RootMutation: any = {
		add: (parent: any, args: any, context: any, resolveInfo: any) => {
			const mutationResolvers: any = {};
			for (const fieldName of mutationFields) {
				mutationResolvers[fieldName] = generateMutationResolver(fieldName);
			}
			return mutationResolvers;
		},
		delete: (parent: any, args: any, context: any, resolveInfo: any) => {
			const mutationResolvers: any = {};
			for (const fieldName of mutationFields) {
				mutationResolvers[fieldName] = generateMutationResolver(fieldName);
			}
			return mutationResolvers;
		},
	};

	return [
		{
			RootQuery,
			RootMutation
		}
	];
};

export default resolvers;

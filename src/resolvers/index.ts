import { DgraphManager } from '../DgraphManager';
import { generateQueryResolver } from './queryResolvers';

const dgraphManager = new DgraphManager();

// const dgraphManager = new DgraphManager('http://some-address:8080');

export const doQuery = dgraphManager.doQuery.bind(dgraphManager);
export const doMutation = dgraphManager.doMutation.bind(dgraphManager);
export const doUpsert = dgraphManager.doUpsert.bind(dgraphManager);

const resolvers = (fields:any ): any[] => {

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
// console.log('RootQuery', JSON.stringify(RootQuery, null, 2));
	return [{
		RootQuery,
		// Mutation: {
		// 	addDataset: async (parent: any, args: any, context: any, resolveInfo: any) => {
		// 		return await doMutation(args.input).then((res: any) => {
		// 			return res;
		// 		});
		// 	},
		// 	addPerson: async (parent: any, args: any, context: any, resolveInfo: any) => {
		// 		console.log(args.input); // Create here your way to resolve this mutation
		// 		return false;
		// 	},
		// 	upsertUser: async (parent: any, args: any, context: any, resolveInfo: any) => {
		// 		const query: any = extraction(resolveInfo, args);
		// 		let upsert = mountUpsert(args, query);
		// 		return await doUpsert(upsert).then((res: any) => {
		// 			return res.upsertUser[0];
		// 		});
		// 	}
		// }
	}]

} 

export default resolvers;

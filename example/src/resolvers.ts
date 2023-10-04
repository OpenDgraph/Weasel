import { extraction, mountUpsert } from '../../src/index';
import { DgraphManager } from '../../src/DgraphManager.ts';

const dgraphManager = new DgraphManager();

// const dgraphManager = new DgraphManager('http://some-address:8080');

export const doQuery = dgraphManager.doQuery.bind(dgraphManager);
export const doMutation = dgraphManager.doMutation.bind(dgraphManager);
export const doUpsert = dgraphManager.doUpsert.bind(dgraphManager);

const queryFields = ['getAlice'];

const transformResult = (result: any, fieldName: string) => {
  
	const arrayData = result[fieldName];
	const countObj = arrayData.find((e: any) => 'count' in e);
	const countValue = countObj ? countObj.count : null;
  
	const updatedArray = arrayData
	  .filter((e: any) => !('count' in e))
	  .map((e: any) => (countValue !== null ? { ...e, count: countValue } : e));
  
	return  updatedArray ;
  };
  

const generateQueryResolver = (fieldName: string) => {
	return async (parent: any, args: any, context: any, resolveInfo: any) => {
		let _arg = context.fieldNodes[0].arguments[0];
		const query = extraction(context, _arg);
		const result = await doQuery(query);
		return transformResult(result, fieldName);
	};
};

const RootQuery: any = {
	query: (parent: any, args: any, context: any, resolveInfo: any) => {
		const queryResolvers: any = {};
		for (const fieldName of queryFields) {
			queryResolvers[fieldName] = generateQueryResolver(fieldName);
		}
		return queryResolvers;
	}
};

export default {
	RootQuery,
	Mutation: {
		addDataset: async (parent: any, args: any, context: any, resolveInfo: any) => {
			return await doMutation(args.input).then((res: any) => {
				return res;
			});
		},
		addPerson: async (parent: any, args: any, context: any, resolveInfo: any) => {
			console.log(args.input); // Create here your way to resolve this mutation
			return false;
		},
		upsertUser: async (parent: any, args: any, context: any, resolveInfo: any) => {
			const query: any = extraction(resolveInfo, args);
			let upsert = mountUpsert(args, query);
			return await doUpsert(upsert).then((res: any) => {
				return res.upsertUser[0];
			});
		}
	}
};

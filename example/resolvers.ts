import { extraction, mountUpsert } from '../src';
import { doQuery, doMutation, doUpsert } from './utils/main';

const reservedList = {
	reverse: ['friend @reverse']
};

export default {
	Query: {
		getAlice: async (parent: any, args: any, context: any, resolveInfo: any) => {
			const query = extraction(resolveInfo, args, context, reservedList);
			let dgraphQuery = query[0];
			return await doQuery({ query: dgraphQuery }).then(res => {
				return res.getAlice;
			});
		}
	},
	Mutation: {
		addDataset: async (parent: any, args: any, context: any, resolveInfo: any) => {
			return await doMutation(args.input).then(res => {
				return res;
			});
		},
		addPerson: async (parent: any, args: any, context: any, resolveInfo: any) => {
			console.log(args.input); // Create here your way to resolve this mutation
			return false;
		},
		upsertUser: async (parent: any, args: any, context: any, resolveInfo: any) => {
			const query: any = extraction(resolveInfo, args, context, reservedList);
			let upsert = mountUpsert(args, query);
			return await doUpsert(upsert, query[1]).then((res: any) => {
				return res.upsertUser[0];
			});
		}
	}
};

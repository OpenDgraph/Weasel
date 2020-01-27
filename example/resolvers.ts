import { extraction, mountUpsert } from '../src';
import { doQuery, doMutation, doUpsert } from './utils/main';

export default {
	Query: {
		getAlice: async (parent: any, args: any, context: any, resolveInfo: any) => {
			const query = extraction(resolveInfo, args);
			return await doQuery(query).then(res => {
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
			const query: any = extraction(resolveInfo, args);
			let upsert = mountUpsert(args, query);
			return await doUpsert(upsert).then((res: any) => {
				return res.upsertUser[0];
			});
		}
	}
};

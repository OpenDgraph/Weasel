import { extraction } from '../src';
import { doQuery, doMutation } from './utils/main';

const reservedList = {
	reverse: ['friend @reverse']
};

export default {
	Query: {
		getAlice: async (parent: any, args: any, context: any, resolveInfo: any) => {
			const query = extraction(resolveInfo, args, context, reservedList);
			return await doQuery({ query }).then(res => {
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
		}
	}
};

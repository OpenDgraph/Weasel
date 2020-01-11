import { extraction } from '../src';
import { doQuery, doMutation } from './utils/main';
import lodash from 'lodash';

const reservedList = {
	reverse: ['edge @reverse']
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
		}
	}
};

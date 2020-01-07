import { extraction } from 'weasel-dgraph';
import { doQuery } from './utils/main';

const reservedList = {
	reverse: ['edge @reverse']
};

export default {
	Query: {
		getAlice: async (parent: any, args: any, context: any, resolveInfo: any) => {
			const query = extraction(resolveInfo, args, context, reservedList);
			return await doQuery({ query }).then(res => {
				return res.getAlice[0];
			});
		}
	}
};

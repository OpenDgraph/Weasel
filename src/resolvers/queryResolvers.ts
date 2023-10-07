import { extraction, mountUpsert } from '../utils';
import { DgraphManager } from '../DgraphManager';

let dgraphManager = null;

if (process.env.RUNNING_JEST === 'true' || process.env.NODE_ENV === 'test') {
	dgraphManager = new DgraphManager('http://dgraph-alpha:8080');
	console.log('Running in Docker');
} else {
	dgraphManager = new DgraphManager();
}

export const doQuery = dgraphManager.doQuery.bind(dgraphManager);

const transformResult = (result: any, fieldName: string) => {
	const arrayData = result[fieldName];
	const countObj = arrayData.find((e: any) => 'count' in e);
	const countValue = countObj ? countObj.count : null;

	const updatedArray = arrayData
		.filter((e: any) => !('count' in e))
		.map((e: any) => (countValue !== null ? { ...e, count: countValue } : e));

	return updatedArray;
};

export const generateQueryResolver = (fieldName: string) => {
	return async (parent: any, args: any, context: any, resolveInfo: any) => {
		let _arg = context.fieldNodes[0].arguments[0];
		console.log(JSON.stringify(context.returnType, null, 2));
		let checkType = JSON.stringify(context.returnType);
		const checkType2 = checkType.includes(']');
		let cType = [checkType.replace("[", "").replace("]", "").replace(/\"/g, ''), checkType2]

		const query = extraction(context, _arg, cType);
		const result = await doQuery(query);

		if (checkType2) {
			return transformResult(result, fieldName);
		} else return transformResult(result, fieldName)[0];
	};
};

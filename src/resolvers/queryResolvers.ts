import { extraction, mountUpsert } from '../utils';
import { DgraphManager } from '../DgraphManager';

const dgraphManager = new DgraphManager();

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
		//console.log('args', _arg);
		// console.log('context', JSON.stringify(context, null, 2));
		console.log(JSON.stringify(context.returnType, null, 2));
		const checkType = JSON.stringify(context.returnType);
		const checkType2 = checkType.includes(']');

		const query = extraction(context, _arg, checkType);
		const result = await doQuery(query);

		console.log('query', query);
		console.log('result', transformResult(result, fieldName));
		if (checkType2) {
			return transformResult(result, fieldName);
		} else return transformResult(result, fieldName)[0];
	};
};

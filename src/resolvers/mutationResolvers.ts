import { DgraphManager } from '../DgraphManager';
import { mountUpsert, mountMutation } from '../utils';
import { extraction } from '../utils';

const dgraphManager = new DgraphManager();

const doUpsert = dgraphManager.doUpsert.bind(dgraphManager);
const doQuery = dgraphManager.doQuery.bind(dgraphManager);
const doMutation = dgraphManager.doMutation.bind(dgraphManager);

const extractMutationInputs = (argObject: any) => {
	const inputs: { [key: string]: any } = {};

	if (
		argObject &&
		argObject.kind === 'Argument' &&
		argObject.name &&
		argObject.name.value === 'input' &&
		argObject.value &&
		argObject.value.kind === 'ObjectValue'
	) {
		const fields = argObject.value.fields;

		fields.forEach((field: any) => {
			if (
				field.kind === 'ObjectField' &&
				field.name &&
				field.name.kind === 'Name' &&
				field.value
			) {
				inputs[field.name.value] = field.value.value;
			}
		});
	}

	return inputs;
};

export const generateMutationResolver = (fieldName: string) => {
	return async (parent: any, args: any, context: any, resolveInfo: any) => {
		let _arg = context.fieldNodes[0].arguments[0];
		const checkType = JSON.stringify(context.returnType).replace(/"/g, '');
    const checkType2 = checkType.includes(']');
    let cType = [checkType.replace("[", "").replace("]", "").replace(/\"/g, ''), checkType2]

		const argObject = context.fieldNodes[0].arguments[0];
		const inputs = context.variableValues.input || extractMutationInputs(argObject);

		const query: any = extraction(context, _arg, cType);
		let result: any = null;

		console.log('query', query);

		if (checkType === 'upsert') {
			const mut = mountUpsert(query, inputs, checkType);
			result = await doUpsert(mut);
		} else {
			const mut = mountMutation(query, inputs, checkType);
			result = await doMutation(mut);
      console.log('code', result.code);
      console.log('message', result.message);
      console.log('queries', result.queries);
      console.log('uids', result.uids);
		}

		let res = result?.uids || result[fieldName][0];
		const regex = /func: ([^)]+\))/;
		const newQuery = query.replace(regex, `func: uid(${res?.id || res[Object.keys(res)[0]]})`);
		console.log(newQuery);
		let doQueryResult = await doQuery(newQuery);

		return doQueryResult[fieldName][0];
	};
};

//! Todo: delete
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

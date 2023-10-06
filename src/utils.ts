import treatRoot from './ASTUtils/treatRoot';
import _iterate from './ASTUtils/iterate';
import initTracer from './tracing';
import { TracingManager } from './TracingManager';

const tracer = initTracer('Weasel');

const tracingManager = new TracingManager(tracer);

const generateRootQuery = (args: any, fieldName: string, rootDirectives: any[], span: any, cType:any[]): any => {
	const childSpan = tracingManager.createSpan('generateRootQuery', span);

	const response = treatRoot(args, fieldName, rootDirectives, childSpan, tracingManager, cType);

	tracingManager.finishSpan(childSpan);
	return response;
};

const generateQueryBody = (fieldNode: any, span: any, cType: any[]): string => {
	const _Type = cType
	const childSpan = tracingManager.createSpan('generateQueryBody', span);
	const response = _iterate(fieldNode, childSpan, tracingManager, _Type);
	tracingManager.finishSpan(childSpan);
	return response;
};

export const extraction = (resolveInfo: any, args: any, checkType: any[]) => {
	const childSpan = tracingManager.createSpan('startExtraction');

	const { fieldName, fieldNodes, returnType } = resolveInfo;
	const fieldNode = fieldNodes[0];
	const { directives: rootDirectives } = fieldNode;

	const rootQuery = generateRootQuery(args, fieldName, rootDirectives, childSpan, checkType);
	const queryBody = generateQueryBody(fieldNode, childSpan, checkType);
	tracingManager.finishSpan(childSpan);

	return `${rootQuery} {\n ${queryBody} \n} \n}`;
};

const addPrefixToKeys = (input: { [key: string]: any }, prefix: string) => {
	const newInput: { [key: string]: any } = {};
  
	if (!prefix) {
	  return input;
	}
  
	Object.keys(input).forEach(key => {
	  if (key !== 'dgraph.type') {
		newInput[`${prefix}.${key}`] = input[key];
	  }
	});
  
	return newInput;
  };
  

export const mountUpsert = (args: any, inputs: any, checkType: string) => {
	const childSpan = tracingManager.createSpan('mountUpsert');

	const _Type = checkType.replace(/"/g, '')
	const checkTypeinInput = false;
	const newInput = addPrefixToKeys(inputs, _Type);
	newInput['dgraph.type'] = `${_Type}`;

	// if (checkTypeRoot) {
	// 	if (!checkTypeinInput) {
	// 		inputs['dgraph.type'] = `${checkType}`;
	// 	} else {
	// 		inputs['dgraph.type'] = [args.type, inputs.dgraph_type];
	// 	}
	// }

	// if (checkTypeinInput) {
	// 	!checkTypeRoot ? (args.input['dgraph.type'] = args.input.dgraph_type) : null;
	// } else if (!checkTypeRoot) {
	// 	args.input['dgraph.type'] = 'unknown';
	// }

	// delete args.input['dgraph_type'];

	let a: any = JSON.stringify(newInput);
	let b: any = JSON.stringify(args);

	tracingManager.finishSpan(childSpan);

	const upsertMutation = `{"query": ${b},"set": ${a}}`;

	return upsertMutation;
};

export const mountMutation = (args: any, inputs: any, checkType: string) => {

	const childSpan = tracingManager.createSpan('mountMutation');

	const _Type = checkType.replace(/"/g, '')

	const newInput = addPrefixToKeys(inputs, _Type);
	newInput['dgraph.type'] = `${_Type}`;

	tracingManager.finishSpan(childSpan);

	return newInput;
};

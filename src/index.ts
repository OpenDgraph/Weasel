import treatRoot from './ASTUtils/treatRoot';
import _iterate from './ASTUtils/iterate';
import initTracer from './tracing';
import { TracingManager } from './TracingManager';

const tracer = initTracer('Weasel');

const tracingManager = new TracingManager(tracer);

const generateRootQuery = (
	args: any,
	fieldName: string,
	rootDirectives: any[],
	span: any
): any => {
	const childSpan = tracingManager.createSpan('generateRootQuery', span);

	const response = treatRoot(args, fieldName, rootDirectives, childSpan, tracingManager);

	tracingManager.finishSpan(childSpan);
	return response;
};

const generateQueryBody = (fieldNode: any, span: any): string => {
	const childSpan = tracingManager.createSpan('generateQueryBody', span);
	const response = _iterate(fieldNode, childSpan, tracingManager);
	tracingManager.finishSpan(childSpan);
	return response;
};

export const extraction = (resolveInfo: any, args: any) => {
	const childSpan = tracingManager.createSpan('startExtraction');

	const { fieldName, fieldNodes, returnType } = resolveInfo;
	const fieldNode = fieldNodes[0];
	const { directives: rootDirectives } = fieldNode;

	const rootQuery = generateRootQuery(args, fieldName, rootDirectives, childSpan);
	const queryBody = generateQueryBody(fieldNode, childSpan);
	tracingManager.finishSpan(childSpan);

	return `${rootQuery} {\n ${queryBody} \n} \n}`;
};

export const mountUpsert = (args: any, query: any) => {
	const childSpan = tracingManager.createSpan('mountUpsert');

	const checkTypeinInput = args && 'dgraph_type' in args.input; //args.input.hasOwnProperty('dgraph_type');
	const checkTypeRoot = 'type' in args;

	tracingManager.log(childSpan, { event: 'checkTypeinInput', value: checkTypeinInput });
	tracingManager.log(childSpan, { event: 'checkTypeRoot', value: checkTypeRoot });

	if (checkTypeRoot) {
		if (!checkTypeinInput) {
			args.input['dgraph.type'] = `${args.type}`;
		} else {
			args.input['dgraph.type'] = [args.type, args.input.dgraph_type];
		}
	}

	if (checkTypeinInput) {
		!checkTypeRoot ? (args.input['dgraph.type'] = args.input.dgraph_type) : null;
	} else if (!checkTypeRoot) {
		args.input['dgraph.type'] = 'unknown';
	}

	delete args.input['dgraph_type'];

	let a: any = JSON.stringify(args.input);
	let b: any = JSON.stringify(query);

	tracingManager.finishSpan(childSpan);

	const upsertMutation = `{"query": ${b},"set": ${a}}`;

	return upsertMutation;
};

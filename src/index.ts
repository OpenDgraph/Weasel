import treatRoot from './ASTUtils/treatRoot';
import _iterate from './ASTUtils/iterate';
import initTracer from './tracing';
import { TracingManager } from './TracingManager';
import * as opentracing from 'opentracing';

const tracer = initTracer('Weasel');

const tracingManager = new TracingManager(tracer);

// Criar um novo span
const rootSpan = tracingManager.createSpan('start-service');

const generateRootQuery = (args: any, fieldName: string, rootDirectives: any[], span: any): any[] => {
	const childSpan = tracingManager.createSpan('generateRootQuery', span);

	const response = treatRoot(args, fieldName, rootDirectives, childSpan, tracingManager);

	tracingManager.finishSpan(childSpan);
	return [response,childSpan];
};

const generateQueryBody = (fieldNode: any, span: any): string => {
	const childSpan = tracingManager.createSpan('generateQueryBody', span);
	const response =_iterate(fieldNode);
	tracingManager.finishSpan(childSpan);
	return response;
};

export const extraction = (resolveInfo: any, args: any) => {
	const childSpan = tracingManager.createSpan('startExtraction', rootSpan);

	const { fieldName, fieldNodes, returnType } = resolveInfo;
	const fieldNode = fieldNodes[0];
	const { directives: rootDirectives } = fieldNode;

	const rootQuery = generateRootQuery(args, fieldName, rootDirectives, childSpan);
	const queryBody = generateQueryBody(fieldNode,rootQuery[1]);
	tracingManager.finishSpan(childSpan);

	return `${rootQuery[0]} {\n ${queryBody} \n} \n}`;
};

export const mountUpsert = (args: any, query: any) => {
	const checkTypeinInput = args && 'dgraph_type' in args.input; //args.input.hasOwnProperty('dgraph_type');
	const checkTypeRoot = 'type' in args;

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

	return `{"query": ${b},"set": ${a}}`;
};

// Finalizar o span
tracingManager.finishSpan(rootSpan);

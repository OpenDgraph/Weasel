import treatRoot from './ASTUtils/treatRoot';
import _iterate from './ASTUtils/iterate';

const generateRootQuery = (args: any, fieldName: string, rootDirectives: any[]): string => {
	return treatRoot(args, fieldName, rootDirectives);
};

const generateQueryBody = (fieldNode: any): string => {
	return _iterate(fieldNode);
};

export const extraction = (resolveInfo: any, args: any) => {
	const { fieldName, fieldNodes, returnType } = resolveInfo;
	const fieldNode = fieldNodes[0];
	const { directives: rootDirectives } = fieldNode;

	const rootQuery = generateRootQuery(args, fieldName, rootDirectives);
	const queryBody = generateQueryBody(fieldNode);

	return `${rootQuery} {\n ${queryBody} \n} \n}`;
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

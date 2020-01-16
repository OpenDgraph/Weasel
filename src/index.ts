import iterate from './ASTUtils/iterate';
import _treat from './ASTUtils/treatQuery';
import treatRoot from './ASTUtils/treatRoot';
import checkForDirectives from './ASTUtils/directives';

export const extraction = (resolveInfo: any, args: any, context: any, reservedList: any) => {
	const { fieldName, fieldNodes, returnType } = resolveInfo;
	const fieldNode = fieldNodes[0];
	const { directives: rootDirectives } = fieldNode;

	const rootQuery = treatRoot(args, fieldName, rootDirectives);
	const queryBody = iterate(fieldNode);

	const listDirectives = checkForDirectives(fieldNode);

	const query = _treat(args, queryBody, reservedList, listDirectives);

	let exBody = `${rootQuery} ${query.exBody}`;
	let cleanBody = `${rootQuery} ${query.cleanBody}`;

	return [exBody, cleanBody];
};

export const mountUpsert = (args: any, query: any) => {
	let a = JSON.stringify(args.input);
	let b = JSON.stringify(query[0]);

	const dtype = /dgraph.type/gim;
	const last = /"}/gim;
	const hasdtype = (theQuery: string) => (theQuery.match(dtype) ? true : false);
	let checkdtype: boolean = hasdtype(a);

	if ('type' in args && !checkdtype) {
		'dgraph_type' in args.input ? null : (a = a.replace(last, `","dgraph.type":${args.type}}`));
	}

	if ('type' in args === false && !checkdtype) {
		'dgraph.type' in args.input ? null : (a = a.replace(last, `","dgraph.type": "unknown"}`));
	}

	return `{"query": ${b},"set": ${a}}`;
};

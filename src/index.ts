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

	return `${rootQuery} ${query}`;
};

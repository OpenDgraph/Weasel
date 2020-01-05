import iterate from './ASTUtils/iterate';
import _treat from './ASTUtils/treatQuery';
import treatRoot from './ASTUtils/treatRoot';

export const extraction = (resolveInfo: any, args: any, context: any, reservedList: any) => {
	const { fieldName, fieldNodes, returnType } = resolveInfo;
	const fieldNode = fieldNodes[0];
	const { directives: rootDirectives } = fieldNode;

	const rootQuery = treatRoot(args, fieldName, rootDirectives);
	const queryBody = iterate(fieldNode);

	const query = _treat(args, queryBody, reservedList);

	return `${rootQuery} ${query}`;
};

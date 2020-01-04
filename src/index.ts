import { iterate } from './ASTUtils/iterate.js';
import { _treat } from './ASTUtils/treatQuery.js';

export const extraction = (resolveInfo: any, args: any, context: any, reservedList: any) => {
	const fieldNode = resolveInfo.fieldNodes[0];
	let innerIterate = iterate(fieldNode);
	let ASTtreated = _treat(args, innerIterate, reservedList);
	return ASTtreated;
};

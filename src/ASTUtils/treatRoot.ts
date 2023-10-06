type ArgsType = { type?: string; func?: string };
type DirectiveType = Array<{
	name: { value: string };
	arguments: Array<{ name: { value: string }; value: { value: string } }>;
}>;

type FieldNameType = string;

export default (
	args: any,
	fieldName: FieldNameType,
	rootDirectives: DirectiveType,
	parentSpan: any,
	tracingManager: any,
	cType: any[]
) => {
	const childSpan = tracingManager.createSpan('treatRoot', parentSpan);

	let filterArg: string | null = null;
	let rootQuery = '';
	let newStr = ''
	let namerArgs = args?.name.value || null
	let valueArgs = args?.value.value || null

	if (cType && cType[1]) {
		valueArgs = newStr
		namerArgs = 'type'
	}

	switch (true) {
		case namerArgs === 'id':
			rootQuery = `func: uid(${valueArgs})`;
			break;
		case namerArgs === 'type' || namerArgs === 'input':
			rootQuery = `func: type(${cType[0]})`;
			break;
		case namerArgs === 'func':
			rootQuery = `func: ${valueArgs}`;
			break;
		default:
			tracingManager.error(childSpan, new Error('Sorry, a root query is mandatory'));
			throw console.error('Sorry, a root query is mandatory');
	}

	const filter = (rootDirectives as Array<any>).find(e => e.name.value === 'filter');

	if (filter) {
		const filterFunc = filter.arguments.find(
			(e: { name: { value: string } }) => e.name.value === 'func'
		);
		filterArg = filterFunc ? filterFunc.value.value : null;
	}
	const final = `{
		${fieldName}(${rootQuery}) ${filterArg ? `@filter(${filterArg})` : ''}`
	tracingManager.log(childSpan, { event: 'root-query', value: final });
	tracingManager.finishSpan(childSpan);
	return final;
};

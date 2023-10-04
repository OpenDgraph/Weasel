type ArgsType = { type?: string; func?: string };
type DirectiveType = Array<{
	name: { value: string };
	arguments: Array<{ name: { value: string }; value: { value: string } }>;
}>;

type FieldNameType = string;

export default (
	args: ArgsType,
	fieldName: FieldNameType,
	rootDirectives: DirectiveType,
	parentSpan: any,
	tracingManager: any
) => {
	const childSpan = tracingManager.createSpan('treatRoot', parentSpan);

	let filterArg: string | null = null;
	let rootQuery = '';

	switch (true) {
		case 'type' in args:
			rootQuery = `func: type(${args.type})`;
			break;
		case 'func' in args:
			rootQuery = `func: ${args.func}`;
			break;
		default:
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

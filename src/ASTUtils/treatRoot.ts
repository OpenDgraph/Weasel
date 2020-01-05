export default (args: any, fieldName: any, rootDirectives: any) => {
	let filter: any;
	let filterArg: any;
	let rootQuery: any;

	switch (true) {
		case 'type' in args:
			rootQuery = `func: type(${args.type})`;
			break;
		case 'func' in args:
			rootQuery = `func: ${args.func}`;
			break;
		default:
			console.log('Sorry, a root query is mandatory');
	}

	filter = rootDirectives.filter((e: any) => e.name.value === 'filter')[0];

	filter
		? (filterArg = filter.arguments.filter((e: any) => e.name.value === 'func')[0].value.value)
		: null;

	return `{
${fieldName}(${rootQuery}) ${filter ? `@filter(${filterArg})` : ``}`;
};

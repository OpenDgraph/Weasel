export default (args: any, fieldName: any, rootDirectives: any) => {
	let filter: any;
	let filterArg: any;

	filter = rootDirectives.filter((e: any) => e.name.value === 'filter')[0];

	filter
		? (filterArg = filter.arguments.filter((e: any) => e.name.value === 'func')[0].value.value)
		: null;

	return `{
${fieldName}(func: type(Object)) ${filter ? `@filter(${filterArg})` : ``}`;
};

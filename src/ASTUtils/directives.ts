export default (fieldNode: any) => {
	let fieldWithDirectives: any;
	let traverseAST: any[] = fieldNode.selectionSet.selections;

	let new_obj: any = traverseAST.map((e: any) => {
		return {
			kind: e.kind,
			alias: e.alias,
			name: { kind: e.name.kind, value: e.name.value },
			arguments: e.arguments,
			directives: e.directives,
			selectionSet: e.selectionSet
		};
	});

	const listDirectives: any = [];

	fieldWithDirectives = new_obj
		.filter((e: any) => e.directives.length > 0)
		.filter((e: any) => e.directives[0].arguments.length > 0);

	fieldWithDirectives.forEach((directive: any) => {
		const {
			directives,
			name: { value: directiveName }
		} = directive;

		const isFacet = directives.filter((e: any) => e.name.value === 'facets')[0];

		switch (true) {
			case !!isFacet: // Case isFacet isn't false
				listDirectives.push({
					[directiveName]: `@facets${
						!!directives && !!directives[0].arguments[0]
							? `(${directives[0].arguments[0].value.value})`
							: ``
					}`
				});

				break;
			default:
				console.log("Some error I think, don't you?");
		}
	});

	return listDirectives;
};

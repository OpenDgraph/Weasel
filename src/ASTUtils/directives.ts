export default (fieldNode: any) => {
	let fieldWithDirectives: any = {};
	const listDirectives: any = [];
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

	let flatten = (children?: any, extractChildren?: any, level?: any) =>
		Array.prototype.concat.apply(
			children.map((x: any) => ({ ...x, level: level || 1 })),
			children.map((x: any) =>
				flatten(
					extractChildren([x].filter((e: any) => !!e.selectionSet)[0]) || [],
					extractChildren,
					(level || 1) + 1
				)
			)
		);

	let extractChildren = (x: any) => {
		if (!x) return;
		return x.selectionSet.selections;
	};

	let flat = flatten(new_obj, extractChildren)
		.map((e: any) => (<any>Object).assign({}, e))
		.map((e: any) => {
			return {
				kind: e.kind,
				alias: e.alias,
				name: e.name.value,
				arguments: !!e.arguments && e.arguments[0] ? e.arguments : undefined,
				directives: !!e.directives && e.directives[0] ? e.directives : undefined,
				selectionSet: e.selectionSet,
				level: e.level
			};
		});

	fieldWithDirectives = flat
		.filter((e: any) => !!e.directives && e.directives.length > 0)
		.filter((e: any) => e.directives[0].arguments.length > 0);

	fieldWithDirectives.forEach((directive: any) => {
		const { directives, name, level } = directive;

		const isFacet = directives.filter((e: any) => e.name.value === 'facets')[0];
		const isVal = directives.filter((e: any) => e.name.value === 'var')[0];

		switch (true) {
			case !!isFacet: // Case isFacet isn't false
				listDirectives.push({
					directive: `@facets${
						!!directives && !!directives[0].arguments[0]
							? `(${directives[0].arguments[0].value.value})`
							: ``
					}`,
					level,
					name
				});

				break;
			case !!isVal:
				listDirectives.push({
					arguments: `${directives[0].arguments[0].value.value}`,
					level,
					name
				});
				break;
			default:
				console.log("Some error I think, don't you?");
		}
	});

	return listDirectives;
};

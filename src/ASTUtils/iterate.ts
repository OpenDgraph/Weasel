export default (AST_OBJ: any) => {
	let traverseAST: any[] = AST_OBJ.selectionSet.selections;
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

	let myquery = '';

	let findpreds = (obj: any) => {
		let predicates = obj
			.filter((e: any) => !(e.directives.length > 0) && !e.selectionSet)
			.map((e: any) => ({
				name: e.name.value === 'id' ? 'id : uid' : e.name.value
			}));
		let query = '';
		for (let value of predicates) {
			query += `${value.name}\n`;
		}
		return query;
	};

	myquery += `${findpreds(new_obj)}\n`;

	let findDirectives = (obj: any) => {
		let directives = obj
			.filter((e: any) => e.directives.length > 0)
			.filter((e: any) => e.directives[0].arguments.length > 0)
			.map((e: any) =>
				e.directives[0].name.value === 'var'
					? {
							name: `${e.directives[0].arguments[0].value.value} as ${
								e.name.value === 'id' ? `id : uid` : e.name.value
							}`
					  }
					: {
							name: e.name.value,
							directive: `@${e.directives[0].name.value}${
								!!e.directives && !!e.directives[0].arguments[0]
									? `(${e.directives[0].arguments[0].value.value})`
									: ``
							}`
					  }
			);
		let query = '';
		for (let value of directives) {
			query += `${value.name} ${!!value.directive ? value.directive : ``}\n`;
		}
		return query;
	};
	myquery += `${findDirectives(new_obj)}\n`;

	let findEdges = (obj: any) => {
		let edgesbe = obj
			.filter((e: any) => e.selectionSet)
			.map((e: any) => ({
				name:
					!!e.directives && e.directives.length > 0
						? // TODO Review the Alias with reverse. Seems to have a bug with repetitive edges in GraphQL
						  !!e.alias
							? `${
									e.directives[0].name.value === 'reverse'
										? `${e.alias.value} : ~${e.name.value}`
										: `${e.alias.value} @${e.directives[0].name.value}`
							  } `
							: `${
									e.directives[0].name.value === 'reverse'
										? `${e.name.value} : ~${e.name.value} `
										: `${e.name.value} @${e.directives[0].name.value}`
							  }`
						: !!e.alias
						? `${e.alias.value} : ${e.name.value}`
						: e.name.value,
				children: !!e.selectionSet.selections
					? `${findpreds(e.selectionSet.selections)} ${findEdges(
							e.selectionSet.selections
					  )} ${findDirectives(e.selectionSet.selections)}`
					: null
			}));
		let query = '';
		for (let value of edgesbe) {
			query += `${value.name} {\n ${value.children} }\n`;
		}
		return query;
	};

	myquery += `${findEdges(new_obj)}\n`;
	return myquery;
};

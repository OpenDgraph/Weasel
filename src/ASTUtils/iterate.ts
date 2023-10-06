type Selection = {
	kind: string;
	alias: string | null;
	name: { kind: string; value: string };
	arguments: any[];
	directives: any[];
	selectionSet: any | null;
};

const mapSelection = (e: any): Selection => ({
	kind: e.kind,
	alias: e.alias,
	name: { kind: e.name.kind, value: e.name.value },
	arguments: e.arguments,
	directives: e.directives,
	selectionSet: e.selectionSet
});

let findpreds = (obj: any, userPrefix: any) => {
	let predicates = obj
		.filter((e: any) => !(e.directives.length > 0) && !e.selectionSet)
		.map((e: any) => ({
			name: e.name.value === 'id' ? 'id : uid' : e.name.value
		}));
	let query = '';
	for (let value of predicates) {
		if (value.name === 'id : uid') {
			query += `${value.name}\n`;
			continue;
		}
		query += `${value.name} : ${userPrefix}.${value.name}\n`;
	}
	return query;
};

const findDirectives = (obj: any[]): string => {
	let directives1 = obj
		.filter((e: any) => e.directives.length > 0)
		.filter((e: any) => e.directives[0]?.name.value === 'count')
		.map((e: any) => {
			return {
				name: 'count: count(uid)'
			};
		});

	let directives2 = obj
		.filter((e: any) => e.directives.length > 0)
		.filter((e: any) => e.directives[0].arguments.length > 0)
		.map((e: any) => {
			return e.directives[0].name.value === 'var'
				? {
						name: `${e.directives[0].arguments[0].value.value} as ${
							e.name.value === 'id' ? 'id : uid' : e.name.value
						}`
				  }
				: {
						name: e.name.value,
						directive: `@${e.directives[0].name.value}${
							!!e.directives && !!e.directives[0].arguments[0]
								? `(${e.directives[0].arguments[0].value.value})`
								: ``
						}`
				  };
		});

	let query = '';
	for (let value of directives1) {
		query += `${value.name}\n`;
	}
	for (let value of directives2) {
		query += `${value.name} ${value.directive ? value.directive : ''}\n`;
	}
	return query;
};

const findEdges = (obj: Selection[], cType?: any): string => {
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
				? `${findpreds(e.selectionSet.selections, cType)} ${findEdges(
						e.selectionSet.selections, cType
				  )} ${findDirectives(e.selectionSet.selections)}`
				: null
		}));
	let query = '';
	for (let value of edgesbe) {
		query += `${value.name} {\n ${value.children} }\n`;
	}
	return query;
};

export default (AST_OBJ: any, parentSpan: any, tracingManager: any, cType: any[]): string => {
	const childSpan = tracingManager.createSpan('iterate body', parentSpan);

	const traverseAST: Selection[] = AST_OBJ.selectionSet.selections.map(mapSelection);

	const predicates = findpreds(traverseAST, cType[0]);
	const directives = findDirectives(traverseAST);
	const edges = findEdges(traverseAST, cType[0]);

	tracingManager.log(childSpan, { event: 'predicates', value: predicates });
	tracingManager.log(childSpan, { event: 'directives', value: directives });
	tracingManager.log(childSpan, { event: 'edges', value: edges });

	const myQuery = [predicates, directives, edges].join('\n');

	tracingManager.finishSpan(childSpan);

	return myQuery;
};

export default (args: any, obj: any, reservedList: any, listDirectives: any) => {
	let theQuery = obj.body;

	let facetsPattern = /\@facets\([^\n]+\)/gim;
	let ReversePattern = /\@reverse/gim;
	let bodyPattern =
		(!!args && !!args.reverse) || !!args.dgraph ? /\{[^)]+\}/gim : /\ {[^)]+\}/gim;

	const hasFacets = (theQuery: string) => (theQuery.match(facetsPattern) ? true : false);
	const hasReverse = (theQuery: string) => (theQuery.match(ReversePattern) ? true : false);

	let checkReverse: boolean = hasReverse(theQuery);
	let checkFacets: boolean = hasFacets(theQuery);

	function resolveFacets(obj: any) {
		if (checkFacets) {
			theQuery = obj.replace(facetsPattern, '');
		}
	}

	function resolveReverse(obj: any) {
		// Todo: This is pretty "hacky". Need a better design.
		try {
			const patterns = checkReverse ? [...reservedList.reverse, ' id\n'] : [' id\n'];
			const regex = new RegExp(patterns.join('|'), 'g');
			let allMatchs: any = obj.match(regex);
			let uniqueMatchs: any = allMatchs.filter(
				(item: any, pos: any) => allMatchs.indexOf(item) == pos
			);
			uniqueMatchs
				? uniqueMatchs.forEach((e: any) => {
						let regex = new RegExp(e, 'g');
						var cleanReverseTag = e.replace(/ @reverse/gi, '');
						obj = obj.replace(
							regex,
							e !== ' id\n'
								? `${cleanReverseTag} : ~${cleanReverseTag}`
								: `id : uid \n`
						);
				  })
				: null;
		} catch {
			return obj;
		}
		return obj;
	}
	resolveFacets(theQuery);

	let extractBody = theQuery.match(bodyPattern);
	let exBody = extractBody[1] ? extractBody[1] : extractBody[0];

	listDirectives.forEach((element: any) => {
		let regex = new RegExp(`${element.name} `, 'g');
		exBody = exBody.replace(regex, `${element.name} ${element.directive}`);
	});

	return resolveReverse(exBody);
};

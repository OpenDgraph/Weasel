export default (args: any, obj: any, reservedList: any, listDirectives: any) => {
	let theQuery = obj.body;

	const ValPattern = /\@var\([^\n]+\)/gim;
	const facetsPattern = /\@facets\([^\n]+\)/gim;
	const ReversePattern = /\@reverse/gim;
	const UIDpatterns = [' id \n', ' id\n', 'id @var'];
	const UIDRegex = new RegExp(UIDpatterns.join('|'), 'g');
	let bodyPattern =
		(!!args && !!args.reverse) || !!args.dgraph ? /\{[^)]+\}/gim : /\ {[^)]+\}/gim;

	const hasVal = (theQuery: string) => (theQuery.match(ValPattern) ? true : false);
	const hasFacets = (theQuery: string) => (theQuery.match(facetsPattern) ? true : false);
	const hasReverse = (theQuery: string) => (theQuery.match(ReversePattern) ? true : false);
	const hasUID = (theQuery: string) => (theQuery.match(UIDRegex) ? true : false);

	let checkVal: boolean = hasVal(theQuery);
	let checkReverse: boolean = hasReverse(theQuery);
	let checkFacets: boolean = hasFacets(theQuery);
	let checkUID: boolean = hasUID(theQuery);

	function cleanFacets(obj: any) {
		if (checkFacets) {
			theQuery = obj.replace(facetsPattern, '');
		}
	}
	function cleanVal(obj: any) {
		if (checkVal) {
			theQuery = obj.replace(ValPattern, ``);
		}
	}
	function resolveReverse(obj: any) {
		// Todo: This is pretty "hacky". Need a better design.
		try {
			const patterns = [...reservedList.reverse, ' id \n', ' id\n', ' @reverse'];
			const regex = new RegExp(patterns.join('|'), 'g');
			let allMatchs: any = obj.match(regex);
			let uniqueMatchs: any = allMatchs.filter(
				(item: any, pos: any) => allMatchs.indexOf(item) == pos
			);
			uniqueMatchs
				? uniqueMatchs.forEach((e: any) => {
						let regex = new RegExp(e, 'g');
						let rev = / @reverse/gi;
						var cleanReverseTag = e.replace(rev, '');
						obj = obj.replace(regex, `${cleanReverseTag} : ~${cleanReverseTag}`);
				  })
				: null;
		} catch {
			return obj;
		}
		return obj;
	}
	function resolveUID(obj: any) {
		// Todo: This is pretty "hacky". Need a better design.
		try {
			let allMatchs: any = obj.match(UIDRegex);
			let uniqueMatchs: any = allMatchs.filter(
				(item: any, pos: any) => allMatchs.indexOf(item) == pos
			);
			uniqueMatchs
				? uniqueMatchs.forEach((e: any) => {
						let regex = new RegExp(e, 'g');
						switch (true) {
							case e === ' id \n':
								obj = obj.replace(regex, `id : uid \n`);
								break;
							case e === ' id\n':
								obj = obj.replace(regex, `id : uid \n`);
								//obj = obj.replace(regex, `v as id : uid \n`);
								break;
							default:
								return;
						}
				  })
				: null;
		} catch {
			return obj;
		}
		return obj;
	}

	cleanFacets(theQuery);
	cleanVal(theQuery);

	let extractBody = theQuery.match(bodyPattern);

	let exBody = extractBody[1] ? extractBody[1] : extractBody[0];

	checkReverse ? (exBody = resolveReverse(exBody)) : null;

	checkUID ? (exBody = resolveUID(exBody)) : null;

	let cleanBody = exBody;
	const test = /id : uid/gim;

	listDirectives
		? listDirectives.forEach((element: any) => {
				switch (true) {
					case checkVal: // Case isFacet isn't false
						let regex = new RegExp(` ${element.name} `, 'g');
						exBody = exBody.replace(regex, `${element.arguments} as ${element.name} `);
						break;
					default:
						let defaultregex = new RegExp(`${element.name} `, 'g');
						exBody = exBody.replace(
							defaultregex,
							`${element.name} ${element.directive}`
						);
				}
		  })
		: null;

	return { exBody, cleanBody };
};

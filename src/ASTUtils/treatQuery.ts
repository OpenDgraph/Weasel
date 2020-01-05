export default (args: any, obj: any, reservedList: any) => {
	let theQuery = obj.body;

	let bodyPattern =
		(!!args && !!args.reverse) || !!args.dgraph ? /\{[^)]+\}/gim : /\ {[^)]+\}/gim;

	let extractBody = theQuery.match(bodyPattern);

	function resolveReverse(obj: any) {
		// Todo: This is pretty "hacky". Need a better design.
		try {
			const hasReverse = (obj: string) => {
				const regex = new RegExp('@reverse', 'g');
				return obj.match(regex) ? true : false;
			};
			const patterns = hasReverse(obj) ? [...reservedList.reverse, ' id\n'] : [' id\n'];
			let uniqueMatchs;
			let allMatchs: any;
			const regex = new RegExp(patterns.join('|'), 'g');
			allMatchs = obj.match(regex);
			uniqueMatchs = allMatchs.filter(
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

	let exBody = extractBody[1] ? extractBody[1] : extractBody[0];

	return resolveReverse(exBody);
};

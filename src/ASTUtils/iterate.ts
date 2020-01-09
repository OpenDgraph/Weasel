export default (obj: any) => {
	let iterate_ = (obj: any) => {
		let new_obj: any = [obj].map(e => {
			return {
				kind: e.kind,
				alias: e.alias,
				name: e.name,
				selectionSet: e.selectionSet,
				loc: e.loc
			};
		})[0];

		var walked: any[] = [];
		var stack: any[] = [
			{
				obj: new_obj,
				stack: ''
			}
		];

		while (stack.length > 0) {
			var item: any = stack.pop();
			var obj: any = item.obj;
			for (var property in obj) {
				if (obj.hasOwnProperty(property)) {
					if (typeof obj[property] == 'object') {
						var alreadyFound = false;
						for (var i = 0; i < walked.length; i++) {
							if (walked[i] === obj[property]) {
								alreadyFound = true;
								break;
							}
						}
						if (!alreadyFound) {
							walked.push(obj[property]);
							stack.push({
								obj: obj[property],
								stack: item.stack + '.' + property
							});
						}
					}
				}
			}
		}

		return {
			RootName: walked[0],
			body: walked[5].body
		};
	};
	return iterate_(obj);
};

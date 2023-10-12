module.exports = async () => {
	let uri: string;

	if (process.env.RUNNING_JEST === 'true' || process.env.NODE_ENV === 'test') {
		uri = 'http://app:4001/update-schema';
	} else {
		uri = 'http://localhost:4001/update-schema';
	}

	await fetch(uri, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ schema: 'type Query { hello: String }' })
	});

};

import * as dgraph from 'dgraph-js-http';

function newClientStub() {
	return new dgraph.DgraphClientStub('http://localhost:8080', false);
}

function newClient(clientStub: any) {
	return new dgraph.DgraphClient(clientStub);
}

const DgraphClientStub = newClientStub();
const dgraphClient = newClient(DgraphClientStub);

export const doQuery = async (query: any) => {
	const txnq = dgraphClient.newTxn();
	let localresp: any;
	try {
		const res = await txnq.query(query);
		localresp = res.data;
	} catch (e) {
		console.log(e);
		await txnq.discard();
	} finally {
		await txnq.discard();
	}
	return localresp;
};

export const doMutation = async (input: any) => {
	const txn = dgraphClient.newTxn();
	let localresp: any;
	try {
		const res = await txn.mutate({
			setNquads: unescape(input.payload),
			commitNow: true
		});
		localresp = res.data;
	} catch (e) {
		console.log(e);
		await txn.discard();
	} finally {
		await txn.discard();
	}
	return localresp.code;
};

export const doUpsert = async (input: any) => {
	const txn = dgraphClient.newTxn();
	let localresp: any;
	try {
		const res: any = await txn.mutate({
			mutation: input,
			commitNow: true
		});
		localresp = res.data.queries;
	} catch (e) {
		console.log(e);
		await txn.discard();
	} finally {
		await txn.discard();
	}
	return localresp;
};

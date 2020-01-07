import * as dgraph from 'dgraph-js-http';

function newClientStub() {
	return new dgraph.DgraphClientStub('http://localhost:8080', false);
}

function newClient(clientStub: any) {
	return new dgraph.DgraphClient(clientStub);
}

const DgraphClientStub = newClientStub();
const dgraphClient = newClient(DgraphClientStub);

export const doQuery = async (q: any) => {
	const txnq = dgraphClient.newTxn();
	let localresp: any;

	try {
		const res = await txnq.query(q.query);
		localresp = res.data;
	} catch (e) {
		console.log(e);
		await txnq.discard();
	} finally {
		await txnq.discard();
	}

	return localresp;
};

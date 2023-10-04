import * as dgraph from 'dgraph-js-http';

export class DgraphManager {
  private clientStub: dgraph.DgraphClientStub;
  private dgraphClient: dgraph.DgraphClient;

  constructor(address = 'http://localhost:8080') {
    this.clientStub = new dgraph.DgraphClientStub(address);
    this.dgraphClient = new dgraph.DgraphClient(this.clientStub);
  }

  async doQuery(query: any) {
    const txn = this.dgraphClient.newTxn();
    let localresp: any;
    try {
      const res = await txn.query(query);
      localresp = res.data;
    } catch (e) {
      console.log(e);
      await txn.discard();
    } finally {
      await txn.discard();
    }
    return localresp;
  }

  async doMutation(input: any) {
    const txn = this.dgraphClient.newTxn();
    let localresp: any;
    try {
      const res = await txn.mutate({
        setNquads: unescape(input.payload),
        commitNow: true,
      });
      localresp = res.data;
    } catch (e) {
      console.log(e);
      await txn.discard();
    } finally {
      await txn.discard();
    }
    return localresp.code;
  }

  async doUpsert(input: any) {
    const txn = this.dgraphClient.newTxn();
    let localresp: any;
    try {
      const res: any = await txn.mutate({
        mutation: input,
        commitNow: true,
      });
      localresp = res.data.queries;
    } catch (e) {
      console.log(e);
      await txn.discard();
    } finally {
      await txn.discard();
    }
    return localresp;
  }

  setClientStubAddress(newAddress: string) {
    this.clientStub = new dgraph.DgraphClientStub(newAddress);
    this.dgraphClient = new dgraph.DgraphClient(this.clientStub);
  }
}

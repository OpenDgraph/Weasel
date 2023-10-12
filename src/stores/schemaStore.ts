import { RedisStore } from './redis'; 

const schemaStore = new RedisStore({ state: "type User { name: String }"}, 'schema');

export default schemaStore;

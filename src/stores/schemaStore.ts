import { RedisStore } from './redis'; 

const schemaStore = new RedisStore({state: {schema: "any"}}, 'schema');

export default schemaStore;
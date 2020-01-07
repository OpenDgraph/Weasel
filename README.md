# Weasel

A direct GraphQL "converter" to Dgraph's `GraphQL+-` language.

### What is Weasel?

Weasel is a direct GraphQL "converter" to Dgraph's `GraphQL+-` language. It is proof of a concept that we can directly relate to both languages.

This project is inspired by join-monster. And it uses the Graphql's AST Object to do it's "magic".

# Before you try out

This code is extremely embryonic and simple. There is a lot of work to do yet.
BTW, help is welcome!

# Usage

> Check the example in `./example/*`

First create your basic apollo-server.

Add to your GraphQL Schema a especial GraphQL Directive.
e.g:

```GRAPHQL
directive @reverse on FIELD | FIELD_DEFINITION
directive @filter(func: String) on FIELD | FIELD_DEFINITION

# Also in the Types you have to define where the directive goes.

  type User {
    id: ID
    friend: [Friend] @reverse
  }

# Add the argument in the Query type.
  type Query {
    getUsers(func: String): [User] @filter #if you pretend to use filters at Root you need to add them in your query using the graphql custom directive `@filter`.
  }

```

## At your resolvers code import the weasel

```JS
import { extraction } from 'weasel-dgraph';
```

And

```JS
export default {
  Query: {
    getObjects: async (parent, args, context, resolveInfo) => {
      const queryConverted = extraction(resolveInfo, args, context, reservedList); // Here it will parse AST and convert to GraphQL+-
      return getAll.Objects(args, queryConverted); // Here goes your resolving code to Dgraph (works with dgraph-js and dgraph-js-http).
    },
  Mutation: {
    CreateObject: async (_, args, context, resolveInfo) => {
      const queryConverted = extraction(resolveInfo, args, context, reservedList);
      const mutation = mutate.CreateObj(args.input); // you gonna use the graphql's input object to mutate in Dgraph.
      return get.Object(args, queryConverted, mutation.uid); // you have to return the UID from the mutation to do a query.
    }
  }
     }
};
```

Todo mutations, you need to execute two Dgraph operations. One mutation and then one query. Due to GraphQL's nature of doing a query and returning what was mutated. Dgraph doesn't have this. So you need to do two operations.

You will need to enter the special definitions of your Schema.

e.g:

```JS
const reservedList = {
  "reverse": [
      'friend @reverse',
      'liveAt @reverse',
      'otherPred @reverse'
  ]
}
```

To know which predicates of your schema have a specific directive you need to query for:

> You can check the Dgraph documentation for other directives.

This code below is just an example of how to query Dgraph's Schema and how to filter schema to get only those predicates with the required directive. You can do it manually tho.

```JS
const { doQuery } = require('./utils/main.js');

const q = `
  schema {
    reverse
  }`;

async function getShema() {
  let sch = await doQuery({q});
  let res = sch.schema.filter(e => e.reverse).map(e => `${e.predicate} @reverse`)
  console.log(res);
}

getShema();
```

# Running GraphQL queries

To be able to use the reverse directive. You need first pass the `@reverse` directive in the reversible edge(s).

> Ids will be converted to `uid`.

Using Dgraph Type at query root.

```GRAPHQL
{
  getObjects(type: "\"Object\"") {
    id
    name
    friend @reverse {
      id
      name
    }
    otherEdge @reverse {
      id
      name
    }
  }
}
```

Using Dgraph's functions at query root.

```GRAPHQL
{
  getObjects(func: eq(dgraph.type, \"Object\")) {
    id
    name
    friend @reverse {
      id
      name
    }
    otherEdge @reverse {
      id
      name
    }
  }
}
```

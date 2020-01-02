# Weasel

A direct GraphQL "converter" to Dgraph's `GraphQL+-` language.

### What is Weasel?

Weasel is a direct GraphQL "converter" to Dgraph's `GraphQL+-` language. It is proof of a concept that we can directly relate to both languages.

This project is inspired by join-monster. And it uses the Graphql's AST Object to do it's "magic".

# Before you try out

This code is extremely embryonic and simple. Mutations are not yet supported. Just queries. There is a lot of work to do yet.
BTW, help is welcome!

# Usage

First create your basic apollo-server.

Add to your GraphQL Schema a especial GraphQL Directive.
e.g:

```GRAPHQL
directive @reverse on FIELD | FIELD_DEFINITION

# Also in the Types you have to define where the directive goes.

  type User {
    id: ID
    friend: [Friend] @reverse
  }

# Add the argument in the Query type.
  type Query {
    getUsers(reverse: Boolean): [User]
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
      const res = getAll.Objects(args, queryConverted); // Here goes your resolving code to Dgraph (works with dgraph-js and dgraph-js-http).
      return res;
    }
     }
};
```

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

>You can check the Dgraph documentation for other directives.

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

To be able to use the reverse directive. You need first pass it as a GraphQL argument `reverse:true` and add the `@reverse` directive in the reversible edge.
> Ids will be converted to `uid`.

```GRAPHQL
{
  getObjects(reverse:true) {
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

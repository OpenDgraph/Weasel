# Weasel

A direct GraphQL "converter" to Dgraph's `GraphQL+-` language.

### What is Weasel?

Weasel is a direct GraphQL "converter" to Dgraph's `GraphQL+-` language. It is proof of a concept that we can directly relate to both languages.

This project is inspired by join-monster. And it uses the Graphql's AST Object to do it's "magic".

# Before you try out.

This code is extremely embryonic and simple. Mutations are not yet supported. Just queries. There is a lot of work to do yet.

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

```

## At your resolvers code import the weasel.

```JS
import { extraction } from 'weasel-dgraph';
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

This code below is just an example of how to query Dgraph's Schema and how to filter schema to get only those predicates with the required directive.

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

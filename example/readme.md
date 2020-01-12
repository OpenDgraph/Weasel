### Write this query in http://localhost:4001/graphql

```GraphQL
{
  getAlice(func:"eq(name, \"Alice\")"){
    id
    name
    mobile @facets(aliases: "mobile_since:since")
    mobile_since
    friend {
      name
      car @facets(aliases: "car_since:since")
      car_since
    }
  }
}
```

## Response

```JSON
{
  "data": {
    "getAlice": {
      "id": "0xc0e38",
      "name": "Alice",
      "mobile": "040123456",
      "mobile_since": "2006-01-02T15:04:05Z"
    }
  }
}
```

## Dataset

Use this dataset <https://docs.dgraph.io/query-language/#facets-edge-attributes>

GraphQL does not support RDF. Therefore, to use RDF in mutations. You will have to make a simple input that I called "Dataset => payload". And within this payload you will insert an escaped string with the RDF inside.

This is an example of the mutation.

```GraphQL
mutation {
  addDataset(input: {
    payload: "PASTE HERE THE ESCAPED DATASET" #use "stringify" to escape it.
  })
}
```

Here is an example to "escape" your dataset to JSON string.

```JS
const dataset = JSON.stringify(`# -- Facets on scalar predicates
_:alice <name> "Alice" .
_:alice <dgraph.type> "Person" .
_:alice <mobile> "040123456" (since=2006-01-02T15:04:05) .
_:alice <car> "MA0123" (since=2006-02-02T13:01:09, first=true) .

_:bob <name> "Bob" .
_:bob <dgraph.type> "Person" .
_:bob <car> "MA0134" (since=2006-02-02T13:01:09) .

_:charlie <name> "Charlie" .
_:charlie <dgraph.type> "Person" .
_:dave <name> "Dave" .
_:dave <dgraph.type> "Person" .


# -- Facets on UID predicates
_:alice <friend> _:bob (close=true, relative=false) .
_:alice <friend> _:charlie (close=false, relative=true) .
_:alice <friend> _:dave (close=true, relative=true) .


# -- Facets for variable propagation
_:movie1 <name> "Movie 1" .
_:movie1 <dgraph.type> "Movie" .
_:movie2 <name> "Movie 2" .
_:movie2 <dgraph.type> "Movie" .
_:movie3 <name> "Movie 3" .
_:movie3 <dgraph.type> "Movie" .

_:alice <rated> _:movie1 (rating=3) .
_:alice <rated> _:movie2 (rating=2) .
_:alice <rated> _:movie3 (rating=5) .

_:bob <rated> _:movie1 (rating=5) .
_:bob <rated> _:movie2 (rating=5) .
_:bob <rated> _:movie3 (rating=5) .

_:charlie <rated> _:movie1 (rating=2) .
_:charlie <rated> _:movie2 (rating=5) .
_:charlie <rated> _:movie3 (rating=1) .`);
```

And of course, you can create mutations with strong GraphQL Types. Because Dgraph supports the input of JSON like objects. In this approach, you will create a default input type (However, Facets are not supported in the default GraphQL input). You can check `./schema.graphql` file in the input and mutation part.

```Graphql
mutation {
  addPerson(input: [{
    uid: "_:Alice",
    name: "Alice",
    mobile: "040123456",
    car: "MA0123",
    rated:[
      {
        uid: "_:movie1",
        dgraph_facets: {
          friend: "(rating: \"3\")"
        }},
      {
        uid: "_:movie2",
        dgraph_facets: {
          friend: "(rating: \"2\")"
        }},
      {
        uid: "_:movie3",
        dgraph_facets: {
          friend: "(rating: \"5\")"
        }}
    ],
    friend: [
      {
        uid: "_:Bob",
        dgraph_facets: {
          friend: "(close: \"true\", relative=\"false\")"
        }},
      {
        uid: "_:Charlie",
        dgraph_facets: {
          friend: "(close: \"false\", relative=\"true\")"
        }},
      {
        uid: "_:Dave",
        dgraph_facets: {
          friend: "(close: \"true\", relative=\"true\")"
        }}
    ],
    dgraph_type: "Person",
    dgraph_facets: {
      name: "(value: \"test\")",
      mobile: "(since=2006-01-02T15:04:05)",
      car: "(since=2006-02-02T13:01:09, first=true)"
    }
  },
    {
      uid: "_:Bob",
      name: "Bob",
      car: "MA0134",
      dgraph_type: "Person",
      rated:[
        {
          uid: "_:movie1",
          dgraph_facets: {
            friend: "(rating: \"5\")"
          }},
        {
          uid: "_:movie2",
          dgraph_facets: {
            friend: "(rating: \"5\")"
          }},
        {
          uid: "_:movie3",
          dgraph_facets: {
            friend: "(rating: \"5\")"
          }}
      ],
      dgraph_facets: {
        car: "(since=2006-02-02T13:01:09)"
      }
    },
    {
      uid: "_:Charlie",
      name: "Charlie",
      dgraph_type: "Person",
      rated:[
        {
          uid: "_:movie1",
          dgraph_facets: {
            friend: "(rating: \"2\")"
          }},
        {
          uid: "_:movie2",
          dgraph_facets: {
            friend: "(rating: \"5\")"
          }},
        {
          uid: "_:movie3",
          dgraph_facets: {
            friend: "(rating: \"1\")"
          }}
      ]
    },
    {
      uid: "_:movie1",
      name: "Movie 1",
      dgraph_type: "Movie"
    },
    {
      uid: "_:movie2",
      name: "Movie 2",
      dgraph_type: "Movie",
    },
    {
      uid: "_:movie3",
      name: "Movie 3",
      dgraph_type: "Movie"
    }
  ])
}

```

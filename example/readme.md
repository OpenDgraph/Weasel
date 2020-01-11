### Write this query in http://localhost:4001/graphql

```GraphQL
{
  getAlice(func:"eq(name, \"Alice\")"){
    id
    name
    mobile @facets(aliases: "mobile_since:since")
    mobile_since
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

And of course, you can create mutations with strong GraphQL Type. Because Dgraph supports the input of JSONs. In this approach, you will create a default input type (However, Facets are not supported in the default GraphQL input).

This is an example of the mutation.

````GraphQL
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
````

## Dataset

Use this dataset https://docs.dgraph.io/query-language/#facets-edge-attributes

### Write this query in http://localhost:4001/graphql

```GraphQL
{
  getAlice(func:"eq(name, \"Alice\")"){
    id
    name
    mobile
  }
}
```

## Response

```JSON
{
  "data": {
    "getAlice": {
      "id": "0xc0e08",
      "name": "Alice",
      "mobile": "040123456"
    }
  }
}
```

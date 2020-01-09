## Dataset

Use this dataset https://docs.dgraph.io/query-language/#facets-edge-attributes

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

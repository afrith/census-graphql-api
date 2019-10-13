# census-graphql-api

This is a a GraphQL API that provides information about places from the South African National Census of 2011.
The information that is available here is the same information that is displayed at https://census2011.adrianfrith.com.
The API is available by `POST` to https://census-api.adrianfrith.com/graphql.


## Schema

```
type Query {
  allProvinces: [Place]
  placeById (id: Int!): Place
  placeByCode (code: String!): Place
  placesByName (name: String!): [Place]
  allPlaceTypes: [PlaceType]
}

scalar JSON

type PlaceType {
  id: Int!
  name: String!
  descrip: String
}

type Place {
  id: Int!
  type: PlaceType!
  code: String!
  name: String
  province: Place
  parent: Place
  population: Int
  households: Int
  area: Float
  children: [Place]
  fullParents: [Place]
  geom: JSON
  demographics: [DemogVariable]
}

type DemogVariable {
  name: String!
  values: [DemogValue]
}

type DemogValue {
  label: String!
  value: Int
}
```

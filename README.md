# census-graphql-api

This is a a GraphQL API that provides information about places from the South African National Census of 2011.
The information that is available here is the same information that is displayed at https://census2011.adrianfrith.com.
The API is available by `POST` to https://census-api.frith.dev/graphql.


## Schema

```graphql
# A read-only schema for South African census data.
type Query {
  # Get multiple places by name, type, and/or geographical coordinates.
  places(name: String, type: String, coordinates: CoordinatesInput): [Place]

  # Get a single place by code.
  place(code: String!): Place

  # Get all place types (Province, Muni, Main Place, etc.)
  placeTypes: [PlaceType]

  # Get a single place type by the short name (e.g. "metro", "subplace", etc.).
  placeType(name: String!): PlaceType

  # Get all variables
  variables: [Variable]

  # Get a variable by ID
  variable(id: ID!): Variable
}

# A place (a province, a municipality, a main place, etc.)
type Place {
  # The unique code assigned to the place by Stats SA.
  code: String!

  # The type of place (Province, Muni, Main Place, etc.)
  type: PlaceType!

  # The name of the place.
  name: String

  # The province in which the place is located.
  province: Place

  # The immediate parent place containing this place.
  parent: Place

  # The population of the place.
  population: Int

  # The number of households in the place.
  households: Int

  # The area of the place in square km.
  area: Float

  # Direct child places contained within this place.
  children: [Place]

  # All parent places within which this place is contained.
  fullParents: [Place]

  # The geometry of the place as a GeoJSON object.
  geom: JSON

  # The bounding box of the place [west, south, east, north].
  bbox: [Float]

  # Details of all demographic variables for the place.
  variables: [PlaceVariable]

  # Details of a single demographic variable for the place.
  variable(variableId: ID!): PlaceVariable
}

# A type of place (Province, Muni, Main Place, etc.).
type PlaceType {
  # Short code (e.g. "metro", "subplace", etc.).
  name: String!

  # Full descriptive title of the place (e.g. "Metropolitan Municipality").
  descrip: String
}

# A demograhic variable (e.g. Gender, Age).
type Variable {
  # Unique ID.
  id: ID!

  # Name of the variable (e.g. "Gender").
  name: String!

  # Possible values (e.g. "Male", "Female").
  labels: [String]
}

# Details about a demographic variable for a particular place.
type PlaceVariable {
  # The variable
  variable: Variable

  # The values of that variable in that place.
  values: [LabelValue]
}

# A pair of a label and a value.
type LabelValue {
  label: String!
  value: Int!
}

# Input value for the coordinate search
input CoordinatesInput {
  latitude: Float!
  longitude: Float!
}

scalar JSON
```

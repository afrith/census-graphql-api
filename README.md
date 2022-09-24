# census-graphql-api

This is a a GraphQL API that provides information about places from the South African National Census of 2011.
The information that is available here is the same information that is displayed at https://census2011.adrianfrith.com.
The API is available by `POST` to https://census-api.frith.dev/graphql. 
See the examples below or the full schema listed at the end of this file.

## Examples

### Name search

The name search on [the census site](https://census2011.adrianfrith.com) is driven by the following query, which requests the code, name, place type, province, population and area.

```graphql
query ($name: String!) {
  placesByName: places(name: $name) {
    code
    name
    type { name descrip }
    province { code name }
    population
    area
  }
}
```

The result of this query looks like the following (in this case the value of `$name` was "pine").

```json
{
  "data": {
    "places": [
      {
        "code": "599116",
        "name": "Pinetown",
        "type": {
          "name": "mainplace",
          "descrip": "Main Place"
        },
        "province": {
          "code": "5",
          "name": "KwaZulu-Natal"
        },
        "population": 144026,
        "area": 86.15482956387405
      },
      // ... 22 more results ...
    ]
  }
}
```

### Full details

This is the query used to populate the place page on the census site; it includes all the information available except the place geometry.

```graphql
query ($code: String!) {
  place(code: $code) {
    code
    name
    type { name descrip }
    fullParents {
      code
      name
      type { name descrip }
    }
    children {
      code
      name
      type { name descrip }
      population
      area
    }
    population
    households
    area
    variables {
      variable { id name }
      values { label value }
    }
    bbox
  }
}
```

The result looks like the following (in this case the value of `$code` was "199041026").

```json
{
  "data": {
    "place": {
      "code": "199041026",
      "name": "Pinelands",
      "type": {
        "name": "subplace",
        "descrip": "Sub Place"
      },
      "fullParents": [
        {
          "code": "1",
          "name": "Western Cape",
          "type": {
            "name": "province",
            "descrip": "Province"
          }
        },
        {
          "code": "199",
          "name": "City of Cape Town",
          "type": {
            "name": "metro",
            "descrip": "Metropolitan Municipality"
          }
        },
        {
          "code": "199041",
          "name": "Cape Town",
          "type": {
            "name": "mainplace",
            "descrip": "Main Place"
          }
        }
      ],
      "children": [
        {
          "code": "1990345",
          "name": "Small Area 0345",
          "type": {
            "name": "sa",
            "descrip": "Small Area"
          },
          "population": 324,
          "area": 0.13688033729831153
        },
        // ... 27 more small areas ...
      ],
      "population": 14198,
      "households": 4915,
      "area": 5.855472074207003,
      "variables": [
        {
          "variable": {
            "id": "1",
            "name": "Gender"
          },
          "values": [
            {
              "label": "Male",
              "value": 6602
            },
            {
              "label": "Female",
              "value": 7596
            }
          ]
        },
        // ... 3 more variables ...
      ],
      "bbox": [
        18.490539049000063,
        -33.949555104999945,
        18.528193225000052,
        -33.91947424799997
      ]
    }
  }
}
```

### Coordinates search

The following query takes a pair of coordinates and finds the subplace that contains that point.

```graphql
query ($latitude: Float!, $longitude: Float!) {
  places(
      type: "subplace",
      coordinates: { latitude: $latitude, longitude: $longitude }
  )
  {
    code
    name
  }
}
```

The result looks like the following (in this case `$latitude` was -33.934 and `$longitude` was 18.415).

```json
{
  "data": {
    "places": [
      {
        "code": "199041044",
        "name": "Oranjezicht"
      }
    ]
  }
}
```

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

import { getPlaceTypes, getPlaceTypeByName } from '../db'

export const typeDefs = `
type PlaceType {
  id: ID! @deprecated(reason: "Use 'name'.")
  name: String!
  descrip: String
}

extend type Query {
  placeType (name: String!): PlaceType
  placeTypes: [PlaceType]
  allPlaceTypes: [PlaceType] @deprecated(reason: "Use 'placeTypes'.")
}
`

export const resolvers = {
  Query: {
    placeType: (_, { name }) => getPlaceTypeByName(name),
    placeTypes: getPlaceTypes,
    allPlaceTypes: getPlaceTypes
  }
}

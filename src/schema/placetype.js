import { getPlaceTypes, getPlaceTypeByName } from '../db'

export const typeDefs = `
type PlaceType {
  name: String!
  descrip: String
}

extend type Query {
  placeType (name: String!): PlaceType
  placeTypes: [PlaceType]
}
`

export const resolvers = {
  Query: {
    placeType: (_, { name }) => getPlaceTypeByName(name),
    placeTypes: getPlaceTypes
  }
}

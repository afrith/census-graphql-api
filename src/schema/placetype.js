import { getPlaceTypes } from '../db'

export const typeDefs = `
type PlaceType {
  id: Int!
  name: String!
  descrip: String
}

extend type Query {
  allPlaceTypes: [PlaceType]
}
`

export const resolvers = {
  Query: {
    allPlaceTypes: getPlaceTypes
  }
}

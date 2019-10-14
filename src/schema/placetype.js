import { getPlaceTypes } from '../db'

export const typeDefs = `
type PlaceType {
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

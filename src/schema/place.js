import { getProvinces, getPlacesByParentId } from '../db'

export const typeDefs = `
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
}

extend type Query {
  allProvinces: [Place]
  placeById (id: Int!): Place
}
`

export const resolvers = {
  Query: {
    allProvinces: getProvinces,
    placeById: (_, { id }, { loaders }) => loaders.place.load(id)
  },

  Place: {
    type: ({ placetype_id: placeTypeId }, _, { loaders }) => loaders.placeType.load(placeTypeId),
    province: ({ province_id: provinceId }, _, { loaders }) => provinceId && loaders.place.load(provinceId),
    parent: ({ parent_id: parentId }, _, { loaders }) => parentId && loaders.place.load(parentId),
    children: ({ id }) => getPlacesByParentId(id)
  }
}

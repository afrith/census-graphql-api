import { UserInputError } from 'apollo-server-koa'
import { getProvinces, getPlaceByCode, getPlacesByName, getPlacesByParentId, getPlaceTree, getDemographics } from '../db'

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

extend type Query {
  allProvinces: [Place]
  placeById (id: Int!): Place
  placeByCode (code: String!): Place
  placesByName (name: String!): [Place]
}
`

export const resolvers = {
  Query: {
    allProvinces: getProvinces,
    placeById: (_, { id }, { loaders }) => loaders.place.load(id),
    placeByCode: (_, { code }) => getPlaceByCode(code),
    placesByName: (_, { name }) => {
      if (name.length < 3) throw new UserInputError('Must provide at least three characters for a name search')
      return getPlacesByName(name)
    }
  },

  Place: {
    type: ({ placetype_id: placeTypeId }, _, { loaders }) => loaders.placeType.load(placeTypeId),
    province: ({ province_id: provinceId }, _, { loaders }) => provinceId && loaders.place.load(provinceId),
    parent: ({ parent_id: parentId }, _, { loaders }) => parentId && loaders.place.load(parentId),
    children: ({ id }) => getPlacesByParentId(id),
    fullParents: ({ parent_id: parentId }) => parentId ? getPlaceTree(parentId) : [],
    geom: ({ id }, _, { loaders }) => loaders.placeGeom.load(id),
    demographics: ({ id }) => getDemographics(id)
  }
}

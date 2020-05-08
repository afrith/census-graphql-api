import { UserInputError } from 'apollo-server-koa'
import { getProvinces, getPlaceByCode, getPlacesByName, getPlacesByParentId, getPlaceTree, getDemographics, getPlaceBbox } from '../db'

export const typeDefs = `
type Place {
  code: String!
  type: PlaceType!
  name: String
  province: Place
  parent: Place
  population: Int
  households: Int
  area: Float
  children: [Place]
  fullParents: [Place]
  geom: JSON
  bbox: [Float]
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
  placeByCode (code: String!): Place
  placesByName (name: String!): [Place]
}
`

export const resolvers = {
  Query: {
    allProvinces: getProvinces,
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
    bbox: ({ id }) => getPlaceBbox(id),
    geom: ({ id }, _, { loaders }) => loaders.placeGeom.load(id),
    demographics: ({ id }) => getDemographics(id)
  }
}

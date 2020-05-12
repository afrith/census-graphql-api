import { UserInputError } from 'apollo-server-koa'
import { getPlaceTypeByName, getPlaceByCode, getPlaces, getPlacesByParentId, getPlaceTree, getPlaceVariables, getPlaceVariable, getPlaceBbox } from '../db'

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
  variables: [PlaceVariable]
  variable (variableId: ID!): PlaceVariable
}

type PlaceVariable {
  variable: Variable
  values: [LabelValue]
}

type LabelValue {
  label: String!
  value: Int!
}

input CoordinatesInput {
  latitude: Float!
  longitude: Float!
}

extend type Query {
  place (code: String!): Place
  places (name: String, type: String, coordinates: CoordinatesInput): [Place]
}
`

const getPlacesHelper = async args => {
  if (Object.keys(args).length === 0) throw new UserInputError('Must specify at least one argument.')

  const params = {}
  if (args.name) {
    if (args.name.length < 3) throw new UserInputError('Must provide at least three characters for a name search.')
    params.name = args.name.trim()
  }

  if (args.type) {
    const type = await getPlaceTypeByName(args.type)
    if (!type) throw new UserInputError(`Invalid type "${type}".`)
    params.typeId = type.id
  }

  if (args.coordinates) params.coordinates = args.coordinates

  return getPlaces(params)
}

export const resolvers = {
  Query: {
    place: (_, { code }) => getPlaceByCode(code),
    places: (_, args) => getPlacesHelper(args)
  },

  Place: {
    type: ({ placetype_id: placeTypeId }, _, { loaders }) => loaders.placeType.load(placeTypeId),
    province: ({ province_id: provinceId }, _, { loaders }) => provinceId && loaders.place.load(provinceId),
    parent: ({ parent_id: parentId }, _, { loaders }) => parentId && loaders.place.load(parentId),
    children: ({ id }) => getPlacesByParentId(id),
    fullParents: ({ parent_id: parentId }) => parentId ? getPlaceTree(parentId) : [],
    bbox: ({ id }) => getPlaceBbox(id),
    geom: ({ id }, _, { loaders }) => loaders.placeGeom.load(id),
    variables: ({ id }) => getPlaceVariables(id),
    variable: ({ id }, { variableId }) => getPlaceVariable(id, variableId)
  }
}

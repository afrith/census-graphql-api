import gql from 'graphql-tag'
import GraphQLJSON from 'graphql-type-json'
import { merge } from 'lodash'

import * as placetype from './placetype'
import * as place from './place'

const subschemas = [placetype, place]

const typeDef = `
type Query

scalar JSON
`

const resolver = {
  JSON: GraphQLJSON
}

export const typeDefs = gql([typeDef, ...subschemas.map(s => s.typeDefs)].join('\n'))

export const resolvers = merge([resolver, ...subschemas.map(s => s.resolvers)])

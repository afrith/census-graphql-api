import gql from 'graphql-tag'
import { merge } from 'lodash'

import * as placetype from './placetype'

const subschemas = [placetype]

const typeDef = `
type Query
`

const resolver = {}

export const typeDefs = gql([typeDef, ...subschemas.map(s => s.typeDefs)].join('\n'))

export const resolvers = merge([resolver, ...subschemas.map(s => s.resolvers)])

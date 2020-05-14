import { getVariables, getVariable, getVariableLabels } from '../db'

export const typeDefs = `
type Variable {
  id: ID!,
  name: String!
  labels: [String]
}

extend type Query {
  variable (id: ID!): Variable
  variables: [Variable]
}
`

export const resolvers = {
  Variable: {
    labels: async variable => variable.labels || getVariableLabels(variable.id)
  },

  Query: {
    variables: getVariables,
    variable: (_, { id }) => getVariable(id)
  }
}

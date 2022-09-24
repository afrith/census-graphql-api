import { pool } from './index'

export const getVariables = async () => {
  const result = await pool.query({
    name: 'getVariables',
    text: 'SELECT id, name FROM census_groupclass'
  })
  return result.rows
}

export const getVariable = async (id) => {
  const result = await pool.query({
    name: 'getVariable',
    text: 'SELECT id, name FROM census_groupclass WHERE id = $1',
    values: [id]
  })
  return result.rows
}

export const getVariableLabels = async (variableId) => {
  const result = await pool.query({
    name: 'getVariableValues',
    text: 'SELECT name FROM census_group WHERE groupclass_id = $1',
    values: [variableId]
  })
  return result.rows.map(row => row.name)
}

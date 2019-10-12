import DataLoader from 'dataloader'
import { pool } from './index'

export const getPlaceTypes = async () => {
  const result = await pool.query({
    name: 'getPlaceTypes',
    text: 'SELECT id, name, descrip FROM census_placetype'
  })
  return result.rows
}

export const getPlaceTypeById = async id => {
  const result = await pool.query({
    name: 'getPlaceType',
    text: 'SELECT id, name, descrip FROM census_placetype WHERE id = $1',
    values: [id]
  })
  return result.rows[0] || null
}

export const getPlaceTypeLoader = () => new DataLoader(async ids => {
  const result = await pool.query({
    name: 'getPlaceTypesById',
    text: 'SELECT id, name, descrip FROM census_placetype WHERE id = ANY($1)',
    values: [ids]
  })
  const keyed = {}
  result.rows.forEach(row => { keyed[row.id] = row })
  return ids.map(id => keyed[id])
})

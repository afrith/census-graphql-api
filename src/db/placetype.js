import { pool } from './index'

export const getPlaceTypes = async () => {
  const result = await pool.query({
    name: 'getPlaceTypes',
    text: 'SELECT id, name, descrip FROM census_placetype'
  })
  return result.rows
}

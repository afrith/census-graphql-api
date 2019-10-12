import DataLoader from 'dataloader'
import { pool } from './index'

const placeFields = ['id', 'placetype_id', 'code', 'name', 'province_id', 'parent_id', 'population', 'households', 'area']

export const getProvinces = async () => {
  const result = await pool.query({
    name: 'getProvinces',
    text: `SELECT ${placeFields.map(f => `p.${f}`).join(', ')}
            FROM census_place p JOIN census_placetype pt ON p.placetype_id = pt.id
            WHERE pt.name = 'province'`
  })
  return result.rows
}

export const getPlaceById = async id => {
  const result = await pool.query({
    name: 'getPlaceById',
    text: `SELECT ${placeFields.join(', ')} FROM census_place WHERE id = $1`,
    values: [id]
  })
  return result.rows[0] || null
}

export const getPlacesByParentId = async parentId => {
  const result = await pool.query({
    name: 'getPlacesByParentId',
    text: `SELECT ${placeFields.join(', ')} FROM census_place WHERE parent_id = $1`,
    values: [parentId]
  })
  return result.rows
}

export const getPlaceTree = async id => {
  const result = await pool.query(`
    WITH RECURSIVE tree AS (
      SELECT ${placeFields.join(', ')} FROM census_place WHERE id = $1
      UNION
      SELECT ${placeFields.map(f => `p.${f}`).join(', ')} FROM census_place p JOIN tree t ON p.id = t.parent_id
    )
    SELECT * FROM tree
  `, [id])
  return result.rows
}

export const getPlaceLoader = () => new DataLoader(async ids => {
  const result = await pool.query({
    name: 'getPlacesById',
    text: `SELECT ${placeFields.join(', ')} FROM census_place WHERE id = ANY($1)`,
    values: [ids]
  })
  const keyed = {}
  result.rows.forEach(row => { keyed[row.id] = row })
  return ids.map(id => keyed[id])
})

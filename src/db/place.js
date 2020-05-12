import DataLoader from 'dataloader'
import { groupBy } from 'lodash'
import { pool } from './index'

const placeFields = ['id', 'placetype_id', 'code', 'name', 'province_id', 'parent_id', 'population', 'households', 'area']

export const getPlaceById = async id => {
  const result = await pool.query({
    name: 'getPlaceById',
    text: `SELECT ${placeFields.join(', ')} FROM census_place WHERE id = $1`,
    values: [id]
  })
  return result.rows[0] || null
}

export const getPlaceByCode = async code => {
  const result = await pool.query({
    name: 'getPlaceByCode',
    text: `SELECT ${placeFields.join(', ')} FROM census_place WHERE code = $1`,
    values: [code]
  })
  return result.rows[0] || null
}

export const getPlacesByParentId = async parentId => {
  const result = await pool.query({
    name: 'getPlacesByParentId',
    text: `SELECT ${placeFields.join(', ')} FROM census_place WHERE parent_id = $1 ORDER BY UPPER(name)`,
    values: [parentId]
  })
  return result.rows
}

export const getPlaces = async args => {
  let text = `SELECT ${placeFields.join(', ')} FROM census_place WHERE TRUE`
  const values = []

  if (args.name) {
    values.push(`%${args.name}%`)
    text += ` AND placetype_id != 8 AND name ILIKE $${values.length}`
  }

  if (args.typeId) {
    values.push(args.typeId)
    text += ` AND placetype_id = $${values.length}`
  }

  if (args.coordinates) {
    const { latitude, longitude } = args.coordinates
    values.push(longitude, latitude)
    text += ` AND ST_Contains(geom, ST_SetSRID(ST_MakePoint($${values.length - 1}, $${values.length}), 4326))`
  }

  text += ' ORDER BY population DESC, placetype_id'

  const result = await pool.query({ text, values })
  return result.rows
}

export const getPlaceTree = async id => {
  const result = await pool.query(`
    WITH RECURSIVE tree AS (
      SELECT ${placeFields.join(', ')}, 0 as n FROM census_place WHERE id = $1
      UNION
      SELECT ${placeFields.map(f => `p.${f}`).join(', ')}, n + 1 FROM census_place p JOIN tree t ON p.id = t.parent_id
    )
    SELECT ${placeFields.join(', ')} FROM tree ORDER BY n DESC
  `, [id])
  return result.rows
}

export const getDemographics = async id => {
  const result = await pool.query({
    name: 'getDemographics',
    text: `SELECT
              gc.name as variable, g.name as label, pg.value
            FROM census_placegroup pg
              JOIN census_place p ON pg.place_id = p.id
              JOIN census_group g ON pg.group_id = g.id
              JOIN census_groupclass gc ON g.groupclass_id = gc.id
            WHERE p.id = $1`,
    values: [id]
  })
  const groups = groupBy(result.rows, 'variable')
  return Object.keys(groups).map(name => ({
    name,
    values: groups[name].map(({ label, value }) => ({ label, value }))
  }))
}

export const getPlaceBbox = async id => {
  const result = await pool.query({
    name: 'getBbox',
    text: `SELECT
            ST_XMin(geom) AS west,
            ST_YMin(geom) AS south,
            ST_XMax(geom) AS east,
            ST_YMax(geom) AS north
          FROM census_place WHERE id = $1`,
    values: [id]
  })
  const row = result.rows[0]
  if (!row) return null
  return [row.west, row.south, row.east, row.north]
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

export const getPlaceGeomLoader = () => new DataLoader(async ids => {
  const result = await pool.query({
    name: 'getPlaceGeomsById',
    text: 'SELECT id, ST_AsGeoJSON(geom, 5) AS geom FROM census_place WHERE id = ANY($1)',
    values: [ids]
  })
  const keyed = {}
  result.rows.forEach(({ id, geom }) => { keyed[id] = JSON.parse(geom) })
  return ids.map(id => keyed[id])
})

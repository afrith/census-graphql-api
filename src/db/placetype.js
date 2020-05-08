import DataLoader from 'dataloader'
import { pool } from './index'

const getPlaceTypesFromDb = async () => {
  const result = await pool.query({
    name: 'getPlaceTypes',
    text: 'SELECT id, name, descrip FROM census_placetype'
  })
  return Object.fromEntries(result.rows.map(pt => [pt.id, pt]))
}

let placeTypesPromise
// Note: not declared 'async' but returns a promise (actually always the same promise)
const getPlaceTypesFromCache = () => {
  if (!placeTypesPromise) placeTypesPromise = getPlaceTypesFromDb()
  return placeTypesPromise
}

export const getPlaceTypes = async () => {
  const placeTypes = await getPlaceTypesFromCache()
  return Object.values(placeTypes)
}

export const getPlaceTypeById = async id => {
  const placeTypes = await getPlaceTypesFromCache()
  return placeTypes[id] || null
}

export const getPlaceTypeLoader = () => new DataLoader(async ids => {
  const placeTypes = await getPlaceTypesFromCache()
  return ids.map(id => placeTypes[id])
})

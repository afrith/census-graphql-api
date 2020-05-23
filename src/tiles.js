import Router from '@koa/router'
import { pool, getPlaceTypes } from './db'

const tileRouter = new Router()
export default tileRouter

const layerMinZoom = {
  mainplace: 7,
  subplace: 9,
  sa: 11
}

tileRouter.get('/:z(\\d+)/:x(\\d+)/:y(\\d+).mvt', async ctx => {
  const z = parseInt(ctx.params.z)
  const x = parseInt(ctx.params.x)
  const y = parseInt(ctx.params.y)
  if (!validateTileCoords(z, x, y)) ctx.throw(404)

  let placeTypes = await getPlaceTypes()
  if (ctx.query.layers) {
    const selectedLayers = ctx.query.layers.split(',').map(l => l.trim())
    placeTypes = placeTypes.filter(({ name }) => selectedLayers.includes(name))
  } else {
    placeTypes = placeTypes.filter(({ name }) => z >= (layerMinZoom[name] || 0))
  }
  const mvts = await Promise.all(placeTypes.map(({ name, id }) => getLayerTile(name, id, z, x, y)))

  ctx.set('Content-Type', 'application/vnd.mapbox-vector-tile')
  ctx.set('Cache-Control', 'public, max-age=604800')
  ctx.body = Buffer.concat(mvts)
})

const tileQuery = `
SELECT ST_AsMVT(mvtgeom.*, $5, 4096, 'geom', 'id') AS mvt FROM (
  SELECT id, code, name, population, households, area,
    ST_AsMVTGeom(geom_proj, ST_TileEnvelope($1, $2, $3)) AS geom
  FROM census_place
  WHERE census_place.placetype_id = $4 AND geom_proj && ST_TileEnvelope($1, $2, $3)
) mvtgeom
`

async function getLayerTile (layerName, typeId, z, x, y) {
  const result = await pool.query({ name: 'makemvt', text: tileQuery, values: [z, x, y, typeId, layerName] })
  return result.rows[0].mvt
}

function validateTileCoords (z, x, y) {
  if (z < 0 || z > 20) return false
  const maxtile = 2 ** z
  if (x < 0 || y < 0 || x >= maxtile || y >= maxtile) return false
  return true
}

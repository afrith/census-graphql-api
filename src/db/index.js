import { Pool, types } from 'pg'

export * from './placetype'
export * from './place'

types.setTypeParser(20, function (val) {
  return parseInt(val)
})

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/census2011'
})

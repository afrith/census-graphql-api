import { Pool } from 'pg'

export * from './placetype'
export * from './place'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost/census2011'
})

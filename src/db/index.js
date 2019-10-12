import { Pool } from 'pg'

export * from './placetype'

export const pool = new Pool({
  connectionString: 'postgresql://localhost/census2011'
})

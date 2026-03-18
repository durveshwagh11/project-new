import pkg from 'pg';

const { Pool } = pkg;

let _pool: InstanceType<typeof Pool> | null = null;

export function getPool() {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }
  return _pool;
}
import pkg from 'pg';

const { Pool } = pkg;

let _pool: InstanceType<typeof Pool> | null = null;

export function getPool() {
	if (!_pool) {
		// Support both DATABASE_URL and individual env vars
		if (process.env.DATABASE_URL) {
			_pool = new Pool({
				connectionString: process.env.DATABASE_URL,
			});
		} else {
			_pool = new Pool({
				host: process.env.DB_HOST,
				port: Number(process.env.DB_PORT),
				user: process.env.DB_USER,
				password: process.env.DB_PASSWORD,
				database: process.env.DB_NAME,
			});
		}
	}
	return _pool;
}

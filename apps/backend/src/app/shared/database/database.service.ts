import { Injectable } from '@nestjs/common';
import { getPool } from './db';

@Injectable()
export class DatabaseService {
	async query(text: string, params?: unknown[]) {
		const client = await getPool().connect();

		try {
			const res = await client.query(text, params);
			return res.rows;
		} catch (err) {
			console.error('DB QUERY ERROR:', err);
			throw err;
		} finally {
			client.release();
		}
	}

	async insert(table: string, data: Record<string, unknown>) {
		// ⚠️ whitelist tables (IMPORTANT)
		const allowedTables = ['users', 'jobs'];

		if (!allowedTables.includes(table)) {
			throw new Error('Invalid table name');
		}

		const keys = Object.keys(data);
		const values = Object.values(data);

		const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

		const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

		return this.query(query, values);
	}
}

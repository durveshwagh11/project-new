#!/usr/bin/env node

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

// Get directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_DIR = join(__dirname, '../src/migrations');

async function runMigrations() {
	// Support both DATABASE_URL and individual env vars
	const pool = new Pool(
		process.env.DATABASE_URL
			? { connectionString: process.env.DATABASE_URL }
			: {
					host: process.env.DB_HOST,
					port: Number(process.env.DB_PORT),
					user: process.env.DB_USER,
					password: process.env.DB_PASSWORD,
					database: process.env.DB_NAME,
				}
	);

	try {
		console.log('🔍 Checking database connection...');
		await pool.query('SELECT NOW()');
		console.log('✅ Database connected');

		// Create migrations tracking table if it doesn't exist
		await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

		// Get already executed migrations
		const { rows: executedMigrations } = await pool.query('SELECT name FROM migrations ORDER BY name');
		const executedNames = new Set(executedMigrations.map((m) => m.name));

		// Get all migration files
		const files = readdirSync(MIGRATIONS_DIR)
			.filter((f) => f.endsWith('.sql'))
			.sort();

		console.log(`\n📁 Found ${files.length} migration file(s)`);

		let executed = 0;
		for (const file of files) {
			if (executedNames.has(file)) {
				console.log(`⏭️  Skipping ${file} (already executed)`);
				continue;
			}

			console.log(`\n▶️  Running ${file}...`);
			const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');

			const client = await pool.connect();
			try {
				await client.query('BEGIN');
				await client.query(sql);
				await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
				await client.query('COMMIT');
				console.log(`✅ ${file} executed successfully`);
				executed++;
			} catch (error) {
				await client.query('ROLLBACK');
				console.error(`❌ Error executing ${file}:`, error);
				throw error;
			} finally {
				client.release();
			}
		}

		if (executed === 0) {
			console.log('\n✨ All migrations up to date');
		} else {
			console.log(`\n✨ Successfully executed ${executed} migration(s)`);
		}
	} catch (error) {
		console.error('\n❌ Migration failed:', error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

runMigrations();

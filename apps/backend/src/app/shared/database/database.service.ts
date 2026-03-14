import { Injectable, OnModuleInit } from "@nestjs/common";
import { neon } from '@neondatabase/serverless';
import { env } from "process";

@Injectable()
export class DatabaseService implements OnModuleInit {
    private sql = neon(env.NEON_CONNECTION_STRING!);

    async onModuleInit() {
        await this.sql.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                access_token TEXT,
                refresh_token TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
    }

    async query(query: string, params?: any[]) {
        try {
            const result = await this.sql.query(query, params);
            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw new Error('Database query failed');
        }
    }

    async insert(table: string, data: Record<string, any>) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
        const values = Object.values(data);

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
        return await this.query(query, values);
    }

    async find(table: string, conditions: Record<string, any>) {
        const whereClauses = Object.keys(conditions).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
        const values = Object.values(conditions);

        const query = `SELECT * FROM ${table} WHERE ${whereClauses}`;
        return await this.query(query, values);
    }
}
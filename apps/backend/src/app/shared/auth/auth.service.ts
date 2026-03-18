import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthService {
	private readonly databaseService = new DatabaseService();

	constructor() {}

	async login(email: string, password: string) {
		if (!email || !password) {
			return 'Email and password are required';
		}

		const users = await this.databaseService.query(
			'SELECT * FROM user_dummy WHERE email = $1 ',
			[email],
		);

		console.log(`Queried users: ${JSON.stringify(users)}`);

		if (users.length === 0) {
			return 'Invalid email or password';
		}

		return 'Login successful';
	}

	async register(email: string, password: string) {
		if (!email || !password) {
			return 'Email and password are required';
		}

		const insertUser = {
			username: email,
			password,
		};

		await this.databaseService.insert('users', insertUser);

		return 'User registered successfully';
	}
}

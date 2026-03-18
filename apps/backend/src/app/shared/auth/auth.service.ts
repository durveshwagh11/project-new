import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
	private readonly databaseService = new DatabaseService();

	async login(email: string, password: string) {
		if (!email || !password) {
			return 'Email and password are required';
		}

		const users = await this.databaseService.query('SELECT id, email FROM users WHERE email = $1 ', [email]);

		if (users.length === 0) {
			return 'Invalid email or password';
		}

		return 'Login successful';
	}

	async signup(email: string, password: string) {
		if (!email || !password) {
			return 'Email and password are required';
		}

		const saltOrRounds = 10;
		const hash = await bcrypt.hash(password, saltOrRounds);

		const insertUser = {
			email: email,
			password: hash,
		};

		await this.databaseService.insert('users', insertUser);

		return 'User registered successfully';
	}
}

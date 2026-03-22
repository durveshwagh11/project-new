import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthDto } from '../auth/dto/auth-dto';

@Injectable()
export class UsersService {
	constructor(private readonly databaseService: DatabaseService) {}

	async createUser(signupUserDto: AuthDto, password: string) {
		const users = await this.databaseService.query('SELECT id, email FROM users WHERE email = $1', [signupUserDto.email]);

		return users;
	}

	async findByEmail(email: string) {
		const rows = await this.databaseService.query('SELECT id, email, password FROM users WHERE email = $1', [email]);
		return rows[0] ?? null;
	}
}

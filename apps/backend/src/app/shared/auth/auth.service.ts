import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthDto } from '../../shared/auth/dto/auth-dto';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly databaseService: DatabaseService,
		private readonly UsersService: UsersService
	) {}

	async login(email: string, password: string) {
		return 'Login successful';
	}

	async signup(signUpData: AuthDto) {
		if (!signUpData.email || !signUpData.password) {
			return 'Email and password are required';
		}

		const saltOrRounds = 10;
		const hash = await bcrypt.hash(signUpData.password, saltOrRounds);

		const users = await this.UsersService.createUser(signUpData, hash);
		this.logger.log(JSON.stringify(users));

		const insertUser = {
			email: signUpData.email,
			password: hash,
		};

		await this.databaseService.insert('users', insertUser);

		return 'User registered successfully';
	}
}

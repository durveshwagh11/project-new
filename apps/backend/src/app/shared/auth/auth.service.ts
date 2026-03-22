import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthDto } from '../../shared/auth/dto/auth-dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly databaseService: DatabaseService,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async login(email: string, password: string) {
		const user = await this.usersService.findByEmail(email);
		if (!user) throw new UnauthorizedException('Invalid credentials');

		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

		return this.generateTokens(user.id, user.email);
	}

	async signup(signUpData: AuthDto) {
		const existing = await this.usersService.findByEmail(signUpData.email);
		if (existing) throw new ConflictException('Email already registered');

		const hash = await bcrypt.hash(signUpData.password, 10);
		const [user] = await this.databaseService.insert('users', {
			email: signUpData.email,
			password: hash,
		});

		this.logger.log(`New user registered: ${user.email}`);
		return this.generateTokens(user.id, user.email);
	}

	async refreshTokens(userId: number, email: string) {
		return this.generateTokens(userId, email);
	}

	private generateTokens(userId: number, email: string) {
		const payload = { sub: userId, email };

		const accessToken = this.jwtService.sign(payload, {
			secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
			expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') as never,
		});

		const refreshToken = this.jwtService.sign(payload, {
			secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
			expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') as never,
		});

		return { accessToken, refreshToken };
	}
}

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const token = this.extractBearerToken(request);
		if (!token) throw new UnauthorizedException('Missing refresh token');

		try {
			const payload = this.jwtService.verify(token, {
				secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
			});
			(request as any)['user'] = payload;
		} catch {
			throw new UnauthorizedException('Invalid or expired refresh token');
		}

		return true;
	}

	private extractBearerToken(request: Request): string | null {
		const auth = request.headers.authorization;
		if (!auth?.startsWith('Bearer ')) return null;
		return auth.slice(7);
	}
}

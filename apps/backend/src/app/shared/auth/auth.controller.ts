import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../../shared/auth/auth.service';
import { AuthDto } from '../../shared/auth/dto/auth-dto';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('login')
	login(@Body() loginInfo: AuthDto) {
		return this.authService.login(loginInfo.email, loginInfo.password);
	}

	@Post('signup')
	signup(@Body() signUpData: AuthDto) {
		return this.authService.signup(signUpData);
	}

	@UseGuards(JwtRefreshGuard)
	@Post('refresh')
	refresh(@Request() req: { user: { sub: number; email: string } }) {
		return this.authService.refreshTokens(req.user.sub, req.user.email);
	}
}

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../../shared/auth/auth.service';
import { AuthDto } from '../../shared/auth/dto/auth-dto';

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
}

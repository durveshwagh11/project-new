import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './jwt.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Module({
	imports: [UsersModule, DatabaseModule, ConfigModule, JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard, JwtRefreshGuard],
	exports: [JwtAuthGuard, JwtRefreshGuard, JwtModule],
})
export class AuthModule {}

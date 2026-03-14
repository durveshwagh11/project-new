import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const globalPrefix = 'v1';
	app.setGlobalPrefix(globalPrefix);
	app.enableCors({
		origin: process.env.FRONTEND_URL || 'http://localhost:4200',
		credentials: true,
	});
	const port = process.env.PORT || 3000;
	await app.listen(port);
	Logger.log(`Backend running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();

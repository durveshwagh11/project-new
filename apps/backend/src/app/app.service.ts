import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
	getHealth(): { status: string } {
		return { status: 'ok' };
	}

	getData(): { message: string } {
		return { message: 'Backend is running' };
	}
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../utils/prisma.service';

@Injectable()
export class NotificationsService {
	constructor(private readonly prisma: PrismaService) {}

	fetchNotifications() {
		
	}
}

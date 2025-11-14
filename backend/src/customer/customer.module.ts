import { Module } from '@nestjs/common';
import { PrismaModule } from '../utils/prisma.module';
import { CustomerGuard } from './customer.guard';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/profile.service';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { NotificationsService } from './notifications/notifications.service';
import { NotificationsController } from './notifications/notifications.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UploadController, ProfileController, NotificationsController],
  providers: [
    // CustomerGuard,
    UploadService,
    ProfileService,
    NotificationsGateway,
    NotificationsService,
  ],
  exports: [],
})
export class CustomerModule {}

import { Module } from '@nestjs/common';
import { UserAuthService } from './user_auth.service';
import { UserAuthController } from './user_auth.controller';
import { PrismaModule } from '../utils/prisma.module';
import { EmailService } from '../utils/email.service';

@Module({
  imports: [PrismaModule],
  controllers: [UserAuthController],
  providers: [UserAuthService, EmailService],
  exports: [UserAuthService],
})
export class UserAuthModule {}

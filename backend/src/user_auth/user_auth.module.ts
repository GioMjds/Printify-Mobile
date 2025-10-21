import { Module } from '@nestjs/common';
import { UserAuthService } from './user_auth.service';
import { UserAuthController } from './user_auth.controller';
import { PrismaModule } from '../utils/prisma.module';
import { EmailService } from '../utils/email.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
      signOptions: { expiresIn: '7d' },
    })
  ],
  controllers: [UserAuthController],
  providers: [UserAuthService, EmailService],
  exports: [UserAuthService],
})
export class UserAuthModule {}

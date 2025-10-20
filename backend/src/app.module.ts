import { Module } from '@nestjs/common';
import { CustomerModule } from './customer/customer.module';
import { PrismaModule } from './utils/prisma.module';
import { UserAuthModule } from './user_auth/user_auth.module';

@Module({
  imports: [CustomerModule, PrismaModule, UserAuthModule],
  providers: [],
})
export class AppModule {}

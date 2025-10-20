import { Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { PrismaModule } from '../utils/prisma.module';
import { CustomerGuard } from './customer.guard';

@Module({
  imports: [PrismaModule],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerGuard],
  exports: [CustomerService],
})
export class CustomerModule {}

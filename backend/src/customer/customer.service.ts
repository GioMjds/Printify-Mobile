import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(dto: CreateCustomerDto): Promise<CustomerEntity> {
    const id = dto.id ?? randomUUID();
    const customer = await this.prisma.user.create({
      data: { ...dto, id },
    });
    return customer as CustomerEntity;
  };

  async getCustomerById(id: string): Promise<CustomerEntity> {
    const customer = await this.prisma.user.findUnique({
      where: { id: id },
    });

    if (!customer) throw new NotFoundException(`Customer with ID ${id} not found`);

    return customer as CustomerEntity;
  };

  async updateCustomer(id: string, dto: UpdateCustomerDto): Promise<CustomerEntity> {
    try {
      const customer = await this.prisma.user.update({
        where: { id: id },
        data: { ...dto }
      });
      return customer as CustomerEntity;
    } catch (error) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
  };

  async deleteCustomer(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: id } });
  }
}

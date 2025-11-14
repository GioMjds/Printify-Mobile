import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { UserRole } from '@prisma/client';

type JwtPayload = {
  sub: string;
  email?: string;
  iat?: number;
  exp: number;
  role?: string;
};

@Injectable()
export class CustomerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    
    // Try to get token from cookies first, then fall back to Authorization header
    let token: string | undefined;
    
    // Check cookies
    if (req.cookies?.access_token) {
      token = req.cookies.access_token;
    }
    
    // Check Authorization header if no cookie found
    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
    }

    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    let payload: JwtPayload;

    try {
      payload = jwt.verify(token, secret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const customer = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!customer) {
      throw new UnauthorizedException('User not found');
    }

    if (customer.role !== UserRole.customer) {
      throw new UnauthorizedException('Only customers are allowed to access this resource');
    }

    (req as any).customer = customer;
    (req as any).tokenPayload = payload;

    return true;
  }
}

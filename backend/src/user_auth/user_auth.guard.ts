import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

type JwtPayload = {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
  role?: string;
};

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.slice(7).trim();
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new UnauthorizedException('JWT secret not configured');
    }

    let payload: JwtPayload;

    try {
      payload = jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    (req as any).user = user;
    (req as any).tokenPayload = payload;
    
    return true;
  }
}

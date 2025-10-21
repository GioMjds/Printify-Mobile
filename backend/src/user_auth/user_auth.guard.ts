import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

type JwtPayload = {
  sub: string;
  email?: string;
  iat?: number;
  exp?: number;
  role?: string;
};

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (!token && typeof req.headers['cookie'] === 'string') {
      const cookieHeader = req.headers['cookie'] as string;
      const cookies = cookieHeader.split(';').map(c => c.trim());
      for (const c of cookies) {
        if (c.startsWith('access_token=')) {
          token = decodeURIComponent(c.split('=')[1] || '');
          break;
        }
      }
    }

    if (!token) {
      throw new UnauthorizedException('Missing or invalid authorization token');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token) as JwtPayload;
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

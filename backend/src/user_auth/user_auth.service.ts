import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { RegisterUser } from './dto/register-user_auth.dto';
import { LoginUser } from './dto/login-user_auth.dto';
import { VerifyOtp } from './dto/verify_otp-user_auth.dto';
import {
  ForgotPassword,
  ResetPassword,
} from './dto/forgot_password-user_auth.dto';
import { compare, hash } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { randomInt, randomUUID } from 'crypto';
import { EmailService } from '../utils/email.service';

type Otp = {
  code: string;
  expiresAt: Date;
  type: 'register' | 'reset';
  firstName?: string;
  lastName?: string;
  hashedPassword?: string;
};

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterUser) {
    const emailLower = dto.email.toLowerCase();

    const firstName = dto.firstName;
    const lastName = dto.lastName;

    if (!firstName || !lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    if (!dto.email || !dto.password) {
      throw new BadRequestException('Email and password are required');
    }

    const confirmPassword = dto.confirmPassword;

    if (confirmPassword === undefined || confirmPassword === null) {
      throw new BadRequestException('Password confirmation is required');
    }

    if (dto.password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await hash(dto.password, 12);

    const otp = this.emailService.generateOtp();
    this.emailService.storeOtp('register', emailLower, otp, {
      firstName,
      lastName,
      hashedPassword,
    });

    try {
      await this.emailService.sendOtpEmail(emailLower, otp, 'Registration');
    } catch (error) {
      console.error('Error sending registration OTP email:', error);
    }

    return {
      message: 'OTP sent to your email',
      firstName,
      lastName,
      email: emailLower,
      otp,
    };
  }

  async resendRegistrationOtp(email: string) {
    const lower = email.toLowerCase();

    const pending = this.emailService.getOtpRecord('register', lower);
    if (pending && pending.firstName && pending.lastName) {
      const otp = this.emailService.generateOtp();
      this.emailService.storeOtp('register', lower, otp, {
        firstName: pending.firstName,
        lastName: pending.lastName,
        hashedPassword: pending.hashedPassword,
      });
      await this.emailService.sendOtpEmail(lower, otp, 'Registration');
      return { message: 'OTP resent successfully' };
    }

    const user = await this.prisma.user.findUnique({ where: { email: lower } });
    if (user && !user.isVerified) {
      const otp = this.emailService.generateOtp();
      this.emailService.storeOtp('register', lower, otp);
      await this.emailService.sendOtpEmail(lower, otp, 'Registration');
      return { message: 'OTP resent successfully', userId: user.id };
    }

    throw new NotFoundException(
      'No pending registration or unverified user found',
    );
  }

  async verifyRegistrationOtp(dto: VerifyOtp) {
    const lower = dto.email.toLowerCase();

    const rec = this.emailService.getOtpRecord('register', lower);

    if (!rec) {
      const userExisting = await this.prisma.user.findUnique({
        where: { email: lower },
      });
      if (!userExisting)
        throw new BadRequestException('Invalid or expired OTP');

      const okExisting = this.emailService.verifyOtp('register', lower, dto.otp);
      if (!okExisting) throw new BadRequestException('Invalid or expired OTP');

      await this.prisma.user.update({
        where: { email: lower },
        data: { isVerified: true },
      });
      return { message: 'Registration successful', userId: userExisting.id };
    }

    if (rec.expiresAt.getTime() < Date.now() || rec.code !== dto.otp) {
      this.emailService.deleteOtpRecord('register', lower);
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashedPassword = rec.hashedPassword!;
    const firstName = rec.firstName ?? undefined;
    const lastName = rec.lastName ?? undefined;

    const created = await this.prisma.user.create({
      data: {
        id: randomUUID(),
        email: lower,
        password: hashedPassword,
        name: `${firstName}${lastName ? ' ' + lastName : ''}`,
        isVerified: true,
      },
    });

    this.emailService.deleteOtpRecord('register', lower);

    return { message: 'Registration successful', userId: created.id };
  }

  async login(dto: LoginUser) {
    const customer = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!customer) throw new UnauthorizedException('Invalid credentials');

    const matched = await compare(dto.password, customer.password);
    if (!matched) throw new UnauthorizedException('Invalid credentials');

    if (!process.env.JWT_SECRET)
      throw new BadRequestException('JWT secret not configured');

    const token = jwt.sign(
      { sub: customer.id, email: customer.email, role: customer.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    return {
      message: 'Login successful',
      access_token: token,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        profile_image: customer.profile_image,
        role: customer.role,
        isVerified: customer.isVerified,
      },
    };
  }

  async forgotPassword(dto: ForgotPassword) {
    const emailLower = dto.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const otp = this.emailService.generateOtp();
    this.emailService.storeOtp('reset', emailLower, otp);
    await this.emailService.sendOtpEmail(emailLower, otp, 'Password Reset');

    return { message: 'OTP sent to your email' };
  }

  async resetPassword(dto: ResetPassword) {
    const emailLower = dto.email.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const ok = this.emailService.verifyOtp('reset', emailLower, dto.otp);
    if (!ok) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const hashed = await hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { email: emailLower },
      data: { password: hashed },
    });

    return { message: 'Password reset successfully' };
  }
}

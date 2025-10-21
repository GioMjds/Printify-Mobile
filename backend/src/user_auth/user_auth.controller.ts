import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { UserAuthService } from './user_auth.service';
import { RegisterUser } from './dto/register-user_auth.dto';
import type { Request, Response } from 'express';
import { LoginUser } from './dto/login-user_auth.dto';
import { VerifyOtp } from './dto/verify_otp-user_auth.dto';
import { ForgotPassword, ResetPassword } from './dto/forgot_password-user_auth.dto';
import { UserAuthGuard } from './user_auth.guard';

@Controller('auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() dto: RegisterUser) {
    return await this.userAuthService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginUser, @Res({ passthrough: true }) res: Response) {
    const result = await this.userAuthService.login(dto);

    const accessMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const refreshMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      maxAge: accessMaxAge,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      maxAge: refreshMaxAge,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    return result;
  }

  @UseGuards(UserAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Post('resend_otp')
  @HttpCode(200)
  async resendOtp(@Body() dto: ForgotPassword) {
    return this.userAuthService.resendRegistrationOtp(dto.email);
  }

  @Post('verify_otp')
  @HttpCode(201)
  async verifyOtp(@Body() dto: VerifyOtp) {
    return this.userAuthService.verifyRegistrationOtp(dto);
  }

  @Post('forgot_password')
  @HttpCode(200)
  async forgotPassword(@Body() dto: ForgotPassword) {
    return this.userAuthService.forgotPassword(dto);
  }

  @Post('reset_password')
  @HttpCode(200)
  async resetPassword(@Body() dto: ResetPassword) {
    return this.userAuthService.resetPassword(dto);
  }
}

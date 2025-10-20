import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';

type Otp = {
  code: string;
  expiresAt: Date;
  type: 'register' | 'reset';
  firstName?: string;
  lastName?: string;
  hashedPassword?: string;
};

@Injectable()
export class EmailService {
  private otpCache = new Map<string, Otp>();
  private otpTTL = 10 * 60 * 1000; // 10 minutes

  private mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  private otpKey(type: Otp['type'], email: string) {
    return `${type}:${email.toLowerCase()}`;
  }

  storeOtp(
    type: Otp['type'],
    email: string,
    code: string,
    extras?: { firstName?: string; lastName?: string; hashedPassword?: string },
  ) {
    const key = this.otpKey(type, email);
    const expiresAt = new Date(Date.now() + this.otpTTL);
    const rec: Otp = {
      code,
      expiresAt,
      type,
      firstName: extras?.firstName,
      lastName: extras?.lastName,
      hashedPassword: extras?.hashedPassword,
    };
    this.otpCache.set(key, rec);
    setTimeout(() => this.otpCache.delete(key), this.otpTTL + 1000);
  }

  getOtpRecord(type: Otp['type'], email: string) {
    const key = this.otpKey(type, email);
    return this.otpCache.get(key);
  }

  deleteOtpRecord(type: Otp['type'], email: string) {
    const key = this.otpKey(type, email);
    this.otpCache.delete(key);
  }

  verifyOtp(type: Otp['type'], email: string, code: string) {
    const key = this.otpKey(type, email);
    const rec = this.otpCache.get(key);
    if (!rec) return false;

    if (rec.expiresAt.getTime() < Date.now()) {
      this.deleteOtpRecord(type, email);
      return false;
    }

    const ok = rec.code === code;
    if (ok) this.deleteOtpRecord(type, email);
    return ok;
  }

  async sendOtpEmail(email: string, code: string, purpose: string) {
    const from = process.env.EMAIL_USER;
    await this.mailTransport.sendMail({
      from,
      to: email,
      subject: `Your OTP Code for ${purpose}`,
      text: `Your ${purpose} code is: ${code}. It will expire in 10 minutes.`,
      html: `<p>Your ${purpose} code is: <b>${code}</b>. It will expire in 10 minutes.</p>`,
    });
  }

  generateOtp(): string {
    return String(randomInt(100000, 999999)).padStart(6, '0');
  }
}

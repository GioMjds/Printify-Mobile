import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

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

  // directory where HTML email templates live
  private templatesDir = join(__dirname, '..', 'user_auth', 'email');

  private loadTemplate(name: string, vars: Record<string, string>) {
    const templatePath = join(this.templatesDir, `${name}.html`);
    try {
      const template = readFileSync(templatePath, 'utf8');
      return template.replace(/{{(\w+)}}/g, (_, key) => vars[key] || '');
    } catch (err) {
      return '';
    }
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
    const timeoutId = setTimeout(() => {
      this.otpCache.delete(key);
    }, this.otpTTL + 1000);
    timeoutId.unref?.();
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
    const tplName = purpose === 'register' ? 'register' : purpose === 'resend' ? 'resend' : 'otp';

    let firstName = '';
    let lastName = '';
    if (purpose === 'register' || purpose === 'reset') {
      const rec = this.getOtpRecord(purpose as Otp['type'], email);
      if (rec) {
        firstName = rec.firstName ?? '';
        lastName = rec.lastName ?? '';
      }
    }

    const vars = {
      code,
      purpose,
      expiry: '10 minutes',
      firstName,
      lastName,
      year: new Date().getFullYear().toString(),
    };

    const htmlFromTemplate = this.loadTemplate(tplName, vars);

    const html = htmlFromTemplate || `<p>Your ${purpose} code is: <b>${code}</b>. It will expire in 10 minutes.</p>`;
    const text = `Your ${purpose} code is: ${code}. It will expire in 10 minutes.`;

    const logoPath = join(__dirname, '..', '..', '..', 'mobile', 'assets', 'images', 'printify.png');

    const mailOptions: any = {
      from,
      to: email,
      subject: `Your OTP Code for ${purpose}`,
      text,
      html,
    };

    // attach logo for inline display when using a template
    if (htmlFromTemplate) {
      mailOptions.attachments = [
        {
          filename: 'printify.png',
          path: logoPath,
          cid: 'printify',
        },
      ];
    }

    await this.mailTransport.sendMail(mailOptions);
  }

  generateOtp(): string {
    return String(randomInt(100000, 999999)).padStart(6, '0');
  }
}

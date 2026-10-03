import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private otpCache: Map<string, { code: string; expiresAt: number }> = new Map();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    // Initialize super admin if not exists
    this.initSuperAdmin();
  }

  async initSuperAdmin() {
    const superAdminPhone = '+380938926388';
    const existingUser = await this.usersService.findByPhone(superAdminPhone);

    if (!existingUser) {
      await this.usersService.createSuperAdmin(superAdminPhone);
      console.log('✅ Super Admin created with phone:', superAdminPhone);
    }
  }

  async register(registerDto: RegisterDto) {
    const { phone } = registerDto;

    // Check if user exists
    let user = await this.usersService.findByPhone(phone);

    if (!user) {
      user = await this.usersService.create({ phone });
    }

    // Generate OTP
    const otp = this.generateOtp();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.otpCache.set(phone, { code: otp, expiresAt });

    // In production, send SMS via Twilio
    if (process.env.SMS_MOCK === 'true') {
      console.log(`📱 OTP for ${phone}: ${otp}`);
    } else {
      // Send SMS via Twilio
      await this.sendSms(phone, `Your RaiderOk verification code: ${otp}`);
    }

    return {
      message: 'OTP sent to your phone',
      phone,
      expiresIn: 600, // 10 minutes in seconds
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { phone, code } = verifyOtpDto;

    const cachedOtp = this.otpCache.get(phone);

    if (!cachedOtp) {
      throw new BadRequestException('OTP not found or expired');
    }

    if (cachedOtp.expiresAt < Date.now()) {
      this.otpCache.delete(phone);
      throw new BadRequestException('OTP expired');
    }

    if (cachedOtp.code !== code) {
      throw new UnauthorizedException('Invalid OTP code');
    }

    // Clear OTP
    this.otpCache.delete(phone);

    // Get or create user
    let user = await this.usersService.findByPhone(phone);

    if (!user) {
      user = await this.usersService.create({ phone });
    }

    // Generate JWT
    const payload = { sub: user.id, phone: user.phone };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        phone: user.phone,
        roles: user.roles?.map((ur) => ({ id: ur.role.id, name: ur.role.name })) || [],
      },
    };
  }

  async validateUser(id: string) {
    return this.usersService.findById(id);
  }

  private generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private async sendSms(phone: string, message: string) {
    // Implement Twilio SMS sending here
    console.log(`📧 SMS to ${phone}: ${message}`);
  }
}

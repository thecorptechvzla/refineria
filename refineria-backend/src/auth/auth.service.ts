import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
      },
      omit: { password: true },
    });

    return user;
  }

  async login(dto: LoginDto, ipAddress: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      await this.recordFailedAttempt(dto.email, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      await this.recordFailedAttempt(dto.email, ipAddress);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.clearFailedAttempts(dto.email, ipAddress);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }

  private async recordFailedAttempt(email: string, ipAddress: string) {
    const existing = await this.prisma.loginSecurity.findUnique({
      where: { email_ipAddress: { email, ipAddress } },
    });

    if (existing) {
      const updated = await this.prisma.loginSecurity.update({
        where: { id: existing.id },
        data: {
          attempts: existing.attempts + 1,
          isBlocked: existing.attempts + 1 >= 2,
        },
      });

      if (updated.isBlocked) {
        throw new ForbiddenException('ACCOUNT_LOCKDOWN');
      }
    } else {
      await this.prisma.loginSecurity.create({
        data: { email, ipAddress, attempts: 1 },
      });
    }
  }

  private async clearFailedAttempts(email: string, ipAddress: string) {
    await this.prisma.loginSecurity.deleteMany({
      where: { email, ipAddress },
    });
  }

  async getSecurityLog() {
    return this.prisma.loginSecurity.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async clearSecurityLog(id: string) {
    await this.prisma.loginSecurity.delete({ where: { id } });
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      omit: { password: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}

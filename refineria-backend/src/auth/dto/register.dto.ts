import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/client';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

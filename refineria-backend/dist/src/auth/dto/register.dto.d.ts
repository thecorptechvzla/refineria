import { Role } from '../../generated/prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: Role;
}

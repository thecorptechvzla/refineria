import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../generated/prisma/enums").Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../generated/prisma/enums").Role;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    getProfile(user: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("../generated/prisma/enums").Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

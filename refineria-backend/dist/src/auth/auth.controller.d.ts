import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    login(dto: LoginDto, res: Response): Promise<{
        token: any;
        user: any;
    }>;
    logout(res: Response): {
        message: string;
    };
    getProfile(user: any): Promise<any>;
}

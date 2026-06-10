import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    login(dto: LoginDto): Promise<{
        token: any;
        user: any;
    }>;
    getProfile(userId: string): Promise<any>;
}

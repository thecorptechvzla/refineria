import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
type JwtPayload = {
    sub: string;
    email: string;
    role: string;
};
declare const JwtStrategy_base: any;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<any>;
}
export {};

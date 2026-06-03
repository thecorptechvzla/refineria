import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        name: string;
        password: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    update(id: string, data: {
        name?: string;
        email?: string;
        role?: Role;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: Role;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<void>;
}

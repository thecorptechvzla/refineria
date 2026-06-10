import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<runtime.Types.Public.PrismaPromise<T>>;
    findById(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    update(id: string, data: {
        name?: string;
        email?: string;
        role?: Role;
    }): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(id: string): Promise<void>;
}

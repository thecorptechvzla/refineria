import { UsersService } from './users.service';
import { Role } from '../common/enums/role.enum';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<runtime.Types.Public.PrismaPromise<T>>;
    findById(id: string): Promise<any>;
    update(id: string, data: {
        name?: string;
        email?: string;
        role?: Role;
    }): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(id: string, user: any): Promise<void>;
}

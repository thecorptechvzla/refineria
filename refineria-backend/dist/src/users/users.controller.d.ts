import { UsersService } from './users.service';
import { Role } from '../common/enums/role.enum';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    remove(id: string, user: any): Promise<void>;
}

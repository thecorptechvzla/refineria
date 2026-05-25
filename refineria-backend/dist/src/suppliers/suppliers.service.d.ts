import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        contactInfo: string;
        registrationDate: Date;
    }[]>;
    findById(id: string): Promise<{
        _count: {
            transactions: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        contactInfo: string;
        registrationDate: Date;
    }>;
    create(dto: CreateSupplierDto): import("../generated/prisma/models").Prisma__SupplierClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        contactInfo: string;
        registrationDate: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    update(id: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        contactInfo: string;
        registrationDate: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        contactInfo: string;
        registrationDate: Date;
    }>;
}

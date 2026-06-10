import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '../generated/prisma/client';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Prisma.PrismaPromise<{
        id: string;
        name: string;
        rif: string;
        contactInfo: string;
        registrationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findById(id: string): Promise<{
        _count: {
            transactions: number;
        };
    } & {
        id: string;
        name: string;
        rif: string;
        contactInfo: string;
        registrationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateSupplierDto): Promise<{
        id: string;
        name: string;
        rif: string;
        contactInfo: string;
        registrationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateSupplierDto): Promise<{
        id: string;
        name: string;
        rif: string;
        contactInfo: string;
        registrationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        rif: string;
        contactInfo: string;
        registrationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryTransactionDto): Promise<{
        data: ({
            supplier: {
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("../generated/prisma/enums").TransactionType;
            weight: number;
            weightUnit: import("../generated/prisma/enums").WeightUnit;
            purity: number;
            supplierId: string | null;
            date: Date;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<{
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            rif: string;
            contactInfo: string;
            registrationDate: Date;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("../generated/prisma/enums").TransactionType;
        weight: number;
        weightUnit: import("../generated/prisma/enums").WeightUnit;
        purity: number;
        supplierId: string | null;
        date: Date;
    }>;
    create(dto: CreateTransactionDto, userId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("../generated/prisma/enums").TransactionType;
        weight: number;
        weightUnit: import("../generated/prisma/enums").WeightUnit;
        purity: number;
        supplierId: string | null;
        date: Date;
    }>;
    private createLotEgreso;
    getMetrics(): Promise<{
        totalIngresos: number;
        totalEgresos: number;
        balance: number;
        workersActivos: number;
        workersInactivos: number;
        workersTotal: number;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("../generated/prisma/enums").TransactionType;
        weight: number;
        weightUnit: import("../generated/prisma/enums").WeightUnit;
        purity: number;
        supplierId: string | null;
        date: Date;
    }>;
}

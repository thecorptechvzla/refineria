import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
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
    create(dto: CreateTransactionDto): Promise<{
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
    getMetrics(): Promise<{
        totalIngresos: number;
        totalEgresos: number;
        balance: number;
        workersActivos: number;
        workersInactivos: number;
        workersTotal: number;
    }>;
    findById(id: string): Promise<{
        supplier: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            contactInfo: string;
            registrationDate: Date;
            rif: string;
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

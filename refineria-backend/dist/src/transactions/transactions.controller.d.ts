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
            date: Date;
            supplierId: string | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(dto: CreateTransactionDto): import("../generated/prisma/models").Prisma__TransactionClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("../generated/prisma/enums").TransactionType;
        weight: number;
        weightUnit: import("../generated/prisma/enums").WeightUnit;
        purity: number;
        date: Date;
        supplierId: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
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
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("../generated/prisma/enums").TransactionType;
        weight: number;
        weightUnit: import("../generated/prisma/enums").WeightUnit;
        purity: number;
        date: Date;
        supplierId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("../generated/prisma/enums").TransactionType;
        weight: number;
        weightUnit: import("../generated/prisma/enums").WeightUnit;
        purity: number;
        date: Date;
        supplierId: string | null;
    }>;
}

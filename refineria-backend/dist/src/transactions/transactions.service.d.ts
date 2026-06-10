import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
export declare class TransactionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: QueryTransactionDto): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<any>;
    create(dto: CreateTransactionDto, userId?: string): Promise<any>;
    private createLotEgreso;
    getMetrics(): Promise<{
        totalIngresos: any;
        totalEgresos: any;
        balance: number;
        workersActivos: any;
        workersInactivos: number;
        workersTotal: any;
    }>;
    remove(id: string): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>>;
}

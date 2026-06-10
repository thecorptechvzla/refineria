import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(query: QueryTransactionDto): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(dto: CreateTransactionDto): Promise<any>;
    getMetrics(): Promise<{
        totalIngresos: any;
        totalEgresos: any;
        balance: number;
        workersActivos: any;
        workersInactivos: number;
        workersTotal: any;
    }>;
    findById(id: string): Promise<any>;
    remove(id: string): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>>;
}

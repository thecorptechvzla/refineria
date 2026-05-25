import { TransactionType } from '../../generated/prisma/client';
export declare class QueryTransactionDto {
    type?: TransactionType;
    supplierId?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}

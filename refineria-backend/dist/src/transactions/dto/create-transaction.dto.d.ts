import { TransactionType, WeightUnit } from '../../generated/prisma/client';
export declare class CreateTransactionDto {
    type: TransactionType;
    weight: number;
    weightUnit: WeightUnit;
    purity: number;
    supplierId?: string;
}

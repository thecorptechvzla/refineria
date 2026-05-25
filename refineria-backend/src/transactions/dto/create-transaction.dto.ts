import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType, WeightUnit } from '../../generated/prisma/client';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsNumber()
  @Min(0)
  weight: number;

  @IsEnum(WeightUnit)
  weightUnit: WeightUnit;

  @IsNumber()
  @Min(0)
  purity: number;

  @IsOptional()
  @IsString()
  supplierId?: string;
}

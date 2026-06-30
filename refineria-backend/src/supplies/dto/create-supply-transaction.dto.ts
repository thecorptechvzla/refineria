import { IsEnum, IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { SupplyTransactionType } from '../../generated/prisma/client';

export class CreateSupplyTransactionDto {
  @IsString()
  itemId: string;

  @IsEnum(SupplyTransactionType)
  type: SupplyTransactionType;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  reference: string;
}

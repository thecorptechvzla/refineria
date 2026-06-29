import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SupplyCategory, SupplyTransactionType } from '../../generated/prisma/client';

class BulkItemDto {
  @IsOptional()
  @IsString()
  itemId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(SupplyCategory)
  category?: SupplyCategory;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  criticalLevel?: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateBulkSupplyTransactionDto {
  @IsEnum(SupplyTransactionType)
  type: SupplyTransactionType;

  @IsNotEmpty()
  destination: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkItemDto)
  items: BulkItemDto[];
}

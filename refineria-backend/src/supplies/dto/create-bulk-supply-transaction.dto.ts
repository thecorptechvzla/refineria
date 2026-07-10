import { IsArray, IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CriticalType, SupplyCategory, SupplyTransactionType } from '../../generated/prisma/client';

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

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsEnum(CriticalType)
  criticalType?: CriticalType;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  reference?: string;
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

import {
  IsEnum,
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';
import { SupplyCategory, CriticalType } from '../../generated/prisma/client';

export class CreateSupplyItemDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(SupplyCategory)
  category: SupplyCategory;

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
}

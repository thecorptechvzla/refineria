import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateGoldBarDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  supplierId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  grossWeight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ley?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  analytical?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  expected?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  recovered?: number;

  @IsString()
  @IsOptional()
  originalLot?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateGoldBarDto {
  @IsString()
  code: string;

  @IsString()
  supplierId: string;

  @IsNumber()
  @Min(0)
  grossWeight: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  ley?: number;

  @IsNumber()
  @Min(0)
  analytical: number;

  @IsNumber()
  @Min(0)
  expected: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  recovered?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  leyAg?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  analyticalAg?: number;

  @IsString()
  @IsOptional()
  originalLot?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

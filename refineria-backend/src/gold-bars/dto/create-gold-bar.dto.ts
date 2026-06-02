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
  analytical: number;

  @IsNumber()
  @Min(0)
  expected: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  recovered?: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

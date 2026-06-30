import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class UpdateBarLeyAgDto {
  @IsString()
  barId: string;

  @IsNumber()
  @Min(0)
  leyAg: number;
}

export class UpdateLotDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  recovered?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateBarLeyAgDto)
  bars?: UpdateBarLeyAgDto[];
}

import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateProcessDto {
  @IsString()
  @IsOptional()
  status?: 'open' | 'closed';

  @IsArray()
  @IsOptional()
  lots?: { id: string; recovered: number }[];
}

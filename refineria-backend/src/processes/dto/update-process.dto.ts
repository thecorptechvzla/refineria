import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateProcessDto {
  @IsString()
  @IsOptional()
  status?: 'open' | 'in_progress' | 'closed';

  @IsArray()
  @IsOptional()
  lots?: { id: string; recovered: number }[];
}

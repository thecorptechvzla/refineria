import { IsString, IsOptional } from 'class-validator';

export class UpdateProcessDto {
  @IsString()
  @IsOptional()
  status?: 'open' | 'closed';
}

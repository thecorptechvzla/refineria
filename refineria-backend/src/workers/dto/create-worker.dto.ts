import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { WorkerStatus } from '../../generated/prisma/client';

export class CreateWorkerDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  position: string;

  @IsOptional()
  @IsEnum(WorkerStatus)
  status?: WorkerStatus;

  @IsOptional()
  @IsString()
  startDate?: string;
}

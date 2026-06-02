import { IsString } from 'class-validator';

export class CreateProcessDto {
  @IsString()
  supplierId: string;
}

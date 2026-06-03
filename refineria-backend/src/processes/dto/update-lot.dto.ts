import { IsNumber, Min } from 'class-validator';

export class UpdateLotDto {
  @IsNumber()
  @Min(0)
  recovered: number;
}

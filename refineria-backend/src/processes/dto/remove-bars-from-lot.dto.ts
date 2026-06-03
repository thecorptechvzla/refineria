import { IsArray, IsString } from 'class-validator';

export class RemoveBarsFromLotDto {
  @IsArray()
  @IsString({ each: true })
  barIds: string[];
}

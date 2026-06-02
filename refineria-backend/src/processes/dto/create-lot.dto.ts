import { IsArray, IsString } from 'class-validator';

export class CreateLotDto {
  @IsArray()
  @IsString({ each: true })
  barIds: string[];
}

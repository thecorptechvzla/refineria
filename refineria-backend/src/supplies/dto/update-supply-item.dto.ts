import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplyItemDto } from './create-supply-item.dto';

export class UpdateSupplyItemDto extends PartialType(CreateSupplyItemDto) {}

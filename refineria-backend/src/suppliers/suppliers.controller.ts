import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('suppliers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Post()
  create(
    @Body() dto: CreateSupplierDto,
    @Body('_customFields') _customFields?: Record<string, string>,
  ) {
    return this.suppliersService.create(dto, _customFields);
  }

  @Get(':id/impact')
  getImpact(@Param('id') id: string) {
    return this.suppliersService.getImpact(id);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.suppliersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @Body('_customFields') _customFields?: Record<string, string>,
  ) {
    return this.suppliersService.update(id, dto, _customFields);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.OWNER)
  remove(@Param('id') id: string) {
    return this.suppliersService.remove(id);
  }
}

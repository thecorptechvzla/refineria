import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/client';
import { SuppliesService } from './supplies.service';
import { CreateSupplyItemDto } from './dto/create-supply-item.dto';
import { UpdateSupplyItemDto } from './dto/update-supply-item.dto';
import { CreateSupplyTransactionDto } from './dto/create-supply-transaction.dto';

@Controller('supplies')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SuppliesController {
  constructor(private readonly suppliesService: SuppliesService) {}

  @Get('items')
  findAllItems(@Query('category') category?: string) {
    return this.suppliesService.findAllItems(category);
  }

  @Get('items/:id')
  findItemById(@Param('id') id: string) {
    return this.suppliesService.findItemById(id);
  }

  @Post('items')
  @Roles(Role.SUPERADMIN, Role.OWNER)
  createItem(@Body() dto: CreateSupplyItemDto) {
    return this.suppliesService.createItem(dto);
  }

  @Patch('items/:id')
  @Roles(Role.SUPERADMIN, Role.OWNER)
  updateItem(@Param('id') id: string, @Body() dto: UpdateSupplyItemDto) {
    return this.suppliesService.updateItem(id, dto);
  }

  @Delete('items/:id')
  @Roles(Role.SUPERADMIN)
  removeItem(@Param('id') id: string) {
    return this.suppliesService.removeItem(id);
  }

  @Post('transactions')
  createTransaction(@Body() dto: CreateSupplyTransactionDto) {
    return this.suppliesService.createTransaction(dto);
  }

  @Get('items/:id/transactions')
  getItemHistory(@Param('id') id: string) {
    return this.suppliesService.getItemHistory(id);
  }
}

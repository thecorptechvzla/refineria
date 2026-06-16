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
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('workers')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get()
  findAll() {
    return this.workersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateWorkerDto) {
    return this.workersService.create(dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.workersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
    return this.workersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN, Role.OWNER)
  remove(@Param('id') id: string) {
    return this.workersService.remove(id);
  }
}

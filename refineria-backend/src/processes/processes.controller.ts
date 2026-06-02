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
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { CreateLotDto } from './dto/create-lot.dto';

@Controller('processes')
@UseGuards(AuthGuard('jwt'))
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Post()
  create(@Body() dto: CreateProcessDto) {
    return this.processesService.create(dto);
  }

  @Get()
  findAll() {
    return this.processesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.processesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProcessDto) {
    return this.processesService.update(id, dto);
  }

  @Post(':id/lots')
  addLot(@Param('id') id: string, @Body() dto: CreateLotDto) {
    return this.processesService.addLot(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.processesService.remove(id);
  }
}

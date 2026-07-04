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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { GoldBarsService, BulkResult } from './gold-bars.service';
import { CreateGoldBarDto } from './dto/create-gold-bar.dto';
import { UpdateGoldBarDto } from './dto/update-gold-bar.dto';

@Controller('gold-bars')
@UseGuards(AuthGuard('jwt'))
export class GoldBarsController {
  constructor(private readonly goldBarsService: GoldBarsService) {}

  @Post()
  create(@Body() dto: CreateGoldBarDto) {
    return this.goldBarsService.create(dto);
  }

  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async bulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('supplierId') supplierId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo Excel');
    }
    if (!supplierId) {
      throw new BadRequestException('Debe seleccionar un proveedor');
    }

    const ext = file.originalname.toLowerCase().split('.').pop() ?? '';
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      throw new BadRequestException('Formato no soportado. Use archivos .xlsx, .xls o .csv');
    }

    return this.goldBarsService.bulkCreate(file, supplierId);
  }

  @Get()
  findAll(@Query('available') available?: string) {
    return this.goldBarsService.findAll(available);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.goldBarsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGoldBarDto) {
    return this.goldBarsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goldBarsService.remove(id);
  }

  @Post('bulk-delete')
  bulkRemove(@Body('ids') ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Debe proporcionar al menos un ID');
    }
    return this.goldBarsService.bulkRemove(ids);
  }
}

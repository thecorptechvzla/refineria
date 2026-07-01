import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';
import { ProcessesService } from '../processes/processes.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly processesService: ProcessesService,
  ) {}

  @Patch('processes/:id/close')
  async closeProcess(
    @Param('id') id: string,
    @Body()
    body: {
      actaRecepcion: string;
      actaFundicion: string;
      actaConformidad: string;
    },
  ) {
    if (!body.actaRecepcion || !body.actaFundicion || !body.actaConformidad) {
      throw new BadRequestException(
        'Debe proporcionar las 3 actas: Recepción, Fundición y Conformidad',
      );
    }

    return this.processesService.closeWithActas(id, {
      actaRecepcion: body.actaRecepcion,
      actaFundicion: body.actaFundicion,
      actaConformidad: body.actaConformidad,
    });
  }

  @Public()
  @Get('processes/:id/actas/:type')
  async getActa(
    @Param('id') id: string,
    @Param('type') type: string,
    @Res() res: Response,
  ) {
    const process = await this.processesService.findById(id);
    const fieldMap: Record<string, string> = {
      recepcion: 'actaRecepcion',
      fundicion: 'actaFundicion',
      conformidad: 'actaConformidad',
    };
    const field = fieldMap[type];
    if (!field) {
      throw new NotFoundException('Tipo de acta inválido');
    }

    const url = (process as Record<string, any>)[field];
    if (!url) {
      throw new NotFoundException('Acta no encontrada');
    }

    await this.filesService.streamActa(url, res);
  }
}

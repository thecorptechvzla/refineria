import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  Res,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { FilesService } from './files.service';
import { ProcessesService } from '../processes/processes.service';

@Controller('processes')
@UseGuards(AuthGuard('jwt'))
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly processesService: ProcessesService,
  ) {}

  @Post(':id/actas')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'actaRecepcion', maxCount: 1 },
        { name: 'actaFundicion', maxCount: 1 },
        { name: 'actaConformidad', maxCount: 1 },
      ],
      { limits: { fileSize: 10 * 1024 * 1024 } },
    ),
  )
  async uploadActas(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      actaRecepcion?: Express.Multer.File[];
      actaFundicion?: Express.Multer.File[];
      actaConformidad?: Express.Multer.File[];
    },
  ) {
    const fileRecepcion = files.actaRecepcion?.[0];
    const fileFundicion = files.actaFundicion?.[0];
    const fileConformidad = files.actaConformidad?.[0];

    if (!fileRecepcion || !fileFundicion || !fileConformidad) {
      throw new BadRequestException(
        'Debe adjuntar las 3 actas: Recepción, Fundición y Conformidad',
      );
    }

    for (const file of [fileRecepcion, fileFundicion, fileConformidad]) {
      if (file.size > 10 * 1024 * 1024) {
        throw new BadRequestException(
          `El archivo ${file.originalname} excede el tamaño máximo de 10MB`,
        );
      }
    }

    const [pathRecepcion, pathFundicion, pathConformidad] = await Promise.all([
      this.filesService.saveActa(id, 'recepcion', fileRecepcion),
      this.filesService.saveActa(id, 'fundicion', fileFundicion),
      this.filesService.saveActa(id, 'conformidad', fileConformidad),
    ]);

    return this.processesService.closeWithActas(id, {
      actaRecepcion: pathRecepcion,
      actaFundicion: pathFundicion,
      actaConformidad: pathConformidad,
    });
  }

  @Public()
  @Get(':id/actas/:type')
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

import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
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
}

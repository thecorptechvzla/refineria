import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Readable } from 'stream';
import type { Response } from 'express';
import { get } from '@vercel/blob';

@Injectable()
export class FilesService {
  async streamActa(url: string, res: Response): Promise<void> {
    try {
      // 1. Guardamos el resultado en una variable (puede ser GetBlobResult o null)
      const blobResult = await get(url, { access: 'private' });

      // 2. Validación estricta para TypeScript: si es null, lanzamos excepción
      if (!blobResult) {
        throw new NotFoundException('Acta no encontrada en Vercel Blob');
      }

      // 3. Una vez validado que no es null, ya puedes acceder a stream y blob sin errores
      const { stream, blob } = blobResult;

      // 4. Asignamos el Content-Type original del archivo
      res.setHeader('Content-Type', blob.contentType || 'application/pdf');

      // 5. Convertimos el stream web al stream compatible con Node.js / Express
      const nodeStream = Readable.fromWeb(stream as any);

      nodeStream.on('error', (error) => {
        console.error('Error en el stream del archivo:', error);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error al transmitir el documento' });
        }
      });

      // 6. Enviamos los datos
      nodeStream.pipe(res);

    } catch (error) {
      console.error('Error al obtener el archivo privado:', error);
      
      // Si el error ya es un HTTP Exception de NestJS (como el 404 de arriba), lo lanzamos tal cual
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Error al recuperar el archivo privado');
    }
  }
}
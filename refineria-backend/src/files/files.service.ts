import { Injectable, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import type { Response } from 'express';

@Injectable()
export class FilesService {
  async streamActa(url: string, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'application/pdf');

    const { get } = await import('@vercel/blob');
    const blob = await get(url, { access: 'private' });
    if (!blob) throw new NotFoundException('Acta no encontrada');

    const nodeStream = Readable.fromWeb(blob.stream as any);
    nodeStream.pipe(res);
  }
}

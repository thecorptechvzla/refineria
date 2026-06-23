import { Injectable, NotFoundException } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { join, extname } from 'path';
import type { Response } from 'express';

@Injectable()
export class FilesService {
  async saveActa(
    processId: string,
    type: 'recepcion' | 'fundicion' | 'conformidad',
    file: Express.Multer.File,
  ): Promise<string> {
    const filename = `${processId}-${type}.pdf`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(filename, file.buffer, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return blob.url;
    }

    const uploadDir = join(process.cwd(), 'uploads', 'actas');
    await mkdir(uploadDir, { recursive: true });
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, file.buffer);
    return `uploads/actas/${filename}`;
  }

  async saveFile(file: Express.Multer.File, subdir: string = 'actas'): Promise<string> {
    const ext = extname(file.originalname) || '.pdf';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const blob = await put(filename, file.buffer, {
        access: 'private',
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      return blob.url;
    }

    const uploadDir = join(process.cwd(), 'uploads', subdir);
    await mkdir(uploadDir, { recursive: true });
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, file.buffer);
    return `uploads/${subdir}/${filename}`;
  }

  async streamActa(url: string, res: Response): Promise<void> {
    res.setHeader('Content-Type', 'application/pdf');

    if (url.startsWith('http')) {
      const { get } = await import('@vercel/blob');
      const blob = await get(url, { access: 'private' });
      if (!blob) throw new NotFoundException('Acta no encontrada en el almacenamiento');
      const nodeStream = Readable.fromWeb(blob.stream as any);
      nodeStream.pipe(res);
    } else {
      const filePath = join(process.cwd(), url);
      createReadStream(filePath).pipe(res);
    }
  }
}

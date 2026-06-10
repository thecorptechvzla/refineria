import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
        access: 'public',
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
}

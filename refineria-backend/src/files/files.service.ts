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
    const uploadDir = join(process.cwd(), 'uploads', 'actas');
    await mkdir(uploadDir, { recursive: true });

    const ext = 'pdf';
    const filename = `${processId}-${type}.${ext}`;
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, file.buffer);

    return `uploads/actas/${filename}`;
  }
}

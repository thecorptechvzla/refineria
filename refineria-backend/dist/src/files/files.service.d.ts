import type { Response } from 'express';
export declare class FilesService {
    saveActa(processId: string, type: 'recepcion' | 'fundicion' | 'conformidad', file: Express.Multer.File): Promise<string>;
    streamActa(url: string, res: Response): Promise<void>;
}

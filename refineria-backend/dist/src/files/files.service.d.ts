export declare class FilesService {
    saveActa(processId: string, type: 'recepcion' | 'fundicion' | 'conformidad', file: Express.Multer.File): Promise<string>;
}

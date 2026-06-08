import { FilesService } from './files.service';
import { ProcessesService } from '../processes/processes.service';
export declare class FilesController {
    private readonly filesService;
    private readonly processesService;
    constructor(filesService: FilesService, processesService: ProcessesService);
    uploadActas(id: string, files: {
        actaRecepcion?: Express.Multer.File[];
        actaFundicion?: Express.Multer.File[];
        actaConformidad?: Express.Multer.File[];
    }): Promise<{
        lots: {
            number: number;
            id: string;
            recovered: number | null;
            processId: string;
            barIds: string[];
            creationDate: Date;
        }[];
    } & {
        number: number;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        supplierId: string;
        status: import("../generated/prisma/enums").ProcessStatus;
        closedAt: Date | null;
        actaRecepcion: string | null;
        actaFundicion: string | null;
        actaConformidad: string | null;
    }>;
}

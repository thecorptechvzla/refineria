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
    }): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$ProcessPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}

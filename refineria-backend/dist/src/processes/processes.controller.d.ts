import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { CreateLotDto } from './dto/create-lot.dto';
import { RemoveBarsFromLotDto } from './dto/remove-bars-from-lot.dto';
export declare class ProcessesController {
    private readonly processesService;
    constructor(processesService: ProcessesService);
    create(dto: CreateProcessDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$ProcessPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    findAll(): runtime.Types.Public.PrismaPromise<T>;
    findById(id: string): Promise<any>;
    update(id: string, dto: UpdateProcessDto): Promise<any>;
    addLot(id: string, dto: CreateLotDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$ProcessLotPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    removeBarsFromLot(lotId: string, dto: RemoveBarsFromLotDto): Promise<{
        deleted: boolean;
        lotId: string;
    }>;
    updateLot(lotId: string, dto: UpdateLotDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$ProcessLotPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    findClosedBySupplier(supplierId: string): Promise<runtime.Types.Public.PrismaPromise<T>>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}

import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { CreateLotDto } from './dto/create-lot.dto';
import { RemoveBarsFromLotDto } from './dto/remove-bars-from-lot.dto';
export declare class ProcessesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProcessDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$ProcessPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    findAll(): runtime.Types.Public.PrismaPromise<T>;
    findById(id: string): Promise<any>;
    update(id: string, dto: UpdateProcessDto): Promise<any>;
    updateLot(lotId: string, dto: UpdateLotDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$ProcessLotPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    addLot(processId: string, dto: CreateLotDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$ProcessLotPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    removeBarsFromLot(lotId: string, dto: RemoveBarsFromLotDto): Promise<{
        deleted: boolean;
        lotId: string;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    findClosedBySupplier(supplierId: string): Promise<runtime.Types.Public.PrismaPromise<T>>;
    closeWithActas(id: string, actas: {
        actaRecepcion: string;
        actaFundicion: string;
        actaConformidad: string;
    }): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$ProcessPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}

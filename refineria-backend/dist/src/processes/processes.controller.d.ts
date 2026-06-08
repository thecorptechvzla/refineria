import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { CreateLotDto } from './dto/create-lot.dto';
import { RemoveBarsFromLotDto } from './dto/remove-bars-from-lot.dto';
export declare class ProcessesController {
    private readonly processesService;
    constructor(processesService: ProcessesService);
    create(dto: CreateProcessDto): Promise<{
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
    findAll(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<({
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
    })[]>;
    findById(id: string): Promise<{
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
    update(id: string, dto: UpdateProcessDto): Promise<({
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
    }) | null>;
    addLot(id: string, dto: CreateLotDto): Promise<{
        number: number;
        id: string;
        recovered: number | null;
        processId: string;
        barIds: string[];
        creationDate: Date;
    }>;
    removeBarsFromLot(lotId: string, dto: RemoveBarsFromLotDto): Promise<{
        deleted: boolean;
        lotId: string;
    }>;
    updateLot(lotId: string, dto: UpdateLotDto): Promise<{
        number: number;
        id: string;
        recovered: number | null;
        processId: string;
        barIds: string[];
        creationDate: Date;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}

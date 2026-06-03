import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { CreateLotDto } from './dto/create-lot.dto';
import { RemoveBarsFromLotDto } from './dto/remove-bars-from-lot.dto';
export declare class ProcessesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProcessDto): Promise<{
        lots: {
            number: number;
            id: string;
            recovered: number | null;
            barIds: string[];
            processId: string;
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
    }>;
    findAll(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<({
        lots: {
            number: number;
            id: string;
            recovered: number | null;
            barIds: string[];
            processId: string;
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
    })[]>;
    findById(id: string): Promise<{
        lots: {
            number: number;
            id: string;
            recovered: number | null;
            barIds: string[];
            processId: string;
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
    }>;
    update(id: string, dto: UpdateProcessDto): Promise<({
        lots: {
            number: number;
            id: string;
            recovered: number | null;
            barIds: string[];
            processId: string;
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
    }) | null>;
    addLot(processId: string, dto: CreateLotDto): Promise<{
        number: number;
        id: string;
        recovered: number | null;
        barIds: string[];
        processId: string;
        creationDate: Date;
    }>;
    removeBarsFromLot(lotId: string, dto: RemoveBarsFromLotDto): Promise<{
        deleted: boolean;
        lotId: string;
    }>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
}

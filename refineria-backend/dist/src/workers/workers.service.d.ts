import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
export declare class WorkersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        position: string;
        status: import("../generated/prisma/enums").WorkerStatus;
        startDate: Date;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        position: string;
        status: import("../generated/prisma/enums").WorkerStatus;
        startDate: Date;
    }>;
    create(dto: CreateWorkerDto): import("../generated/prisma/models").Prisma__WorkerClient<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        position: string;
        status: import("../generated/prisma/enums").WorkerStatus;
        startDate: Date;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    update(id: string, dto: UpdateWorkerDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        position: string;
        status: import("../generated/prisma/enums").WorkerStatus;
        startDate: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        position: string;
        status: import("../generated/prisma/enums").WorkerStatus;
        startDate: Date;
    }>;
}

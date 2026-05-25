import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
export declare class WorkersController {
    private readonly workersService;
    constructor(workersService: WorkersService);
    findAll(): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        position: string;
        status: import("../generated/prisma/enums").WorkerStatus;
        startDate: Date;
    }[]>;
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
    findById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        position: string;
        status: import("../generated/prisma/enums").WorkerStatus;
        startDate: Date;
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

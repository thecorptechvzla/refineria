import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
export declare class WorkersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): runtime.Types.Public.PrismaPromise<T>;
    findById(id: string): Promise<any>;
    create(dto: CreateWorkerDto): import("../generated/prisma/models").Prisma__WorkerClient<runtime.Types.Result.GetResult<import("../generated/prisma/models").$WorkerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, runtime.Types.Extensions.DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    update(id: string, dto: UpdateWorkerDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$WorkerPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(id: string): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$WorkerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>>;
}

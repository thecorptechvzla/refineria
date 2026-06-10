import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
export declare class WorkersController {
    private readonly workersService;
    constructor(workersService: WorkersService);
    findAll(): runtime.Types.Public.PrismaPromise<T>;
    create(dto: CreateWorkerDto): import("../generated/prisma/models").Prisma__WorkerClient<runtime.Types.Result.GetResult<import("../generated/prisma/models").$WorkerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, runtime.Types.Extensions.DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    findById(id: string): Promise<any>;
    update(id: string, dto: UpdateWorkerDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$WorkerPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(id: string): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$WorkerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>>;
}

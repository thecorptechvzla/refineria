import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Prisma } from '../generated/prisma/client';
export declare class SuppliersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): runtime.Types.Public.PrismaPromise<T>;
    findById(id: string): Promise<any>;
    create(dto: CreateSupplierDto): Promise<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    update(id: string, dto: UpdateSupplierDto): Promise<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(id: string): Promise<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "delete", GlobalOmitOptions>>;
}

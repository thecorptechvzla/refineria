import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
export declare class SuppliersController {
    private readonly suppliersService;
    constructor(suppliersService: SuppliersService);
    findAll(): runtime.Types.Public.PrismaPromise<T>;
    create(dto: CreateSupplierDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$SupplierPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    findById(id: string): Promise<any>;
    update(id: string, dto: UpdateSupplierDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$SupplierPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(id: string): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$SupplierPayload<ExtArgs>, T, "delete", GlobalOmitOptions>>;
}

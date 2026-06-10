import { GoldBarsService } from './gold-bars.service';
import { CreateGoldBarDto } from './dto/create-gold-bar.dto';
import { UpdateGoldBarDto } from './dto/update-gold-bar.dto';
export declare class GoldBarsController {
    private readonly goldBarsService;
    constructor(goldBarsService: GoldBarsService);
    create(dto: CreateGoldBarDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$GoldBarPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    findAll(available?: string): runtime.Types.Public.PrismaPromise<T>;
    findById(id: string): Promise<any>;
    update(id: string, dto: UpdateGoldBarDto): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$GoldBarPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(id: string): Promise<runtime.Types.Result.GetResult<import("../generated/prisma/models").$GoldBarPayload<ExtArgs>, T, "delete", GlobalOmitOptions>>;
}

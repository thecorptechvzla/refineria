import { GoldBarsService } from './gold-bars.service';
import { CreateGoldBarDto } from './dto/create-gold-bar.dto';
import { UpdateGoldBarDto } from './dto/update-gold-bar.dto';
export declare class GoldBarsController {
    private readonly goldBarsService;
    constructor(goldBarsService: GoldBarsService);
    create(dto: CreateGoldBarDto): import("../generated/prisma/models").Prisma__GoldBarClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationDate: Date;
        supplierId: string;
        code: string;
        grossWeight: number;
        analytical: number;
        expected: number;
        recovered: number;
        available: boolean;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    findAll(available?: string): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationDate: Date;
        supplierId: string;
        code: string;
        grossWeight: number;
        analytical: number;
        expected: number;
        recovered: number;
        available: boolean;
    }[]>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationDate: Date;
        supplierId: string;
        code: string;
        grossWeight: number;
        analytical: number;
        expected: number;
        recovered: number;
        available: boolean;
    }>;
    update(id: string, dto: UpdateGoldBarDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationDate: Date;
        supplierId: string;
        code: string;
        grossWeight: number;
        analytical: number;
        expected: number;
        recovered: number;
        available: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationDate: Date;
        supplierId: string;
        code: string;
        grossWeight: number;
        analytical: number;
        expected: number;
        recovered: number;
        available: boolean;
    }>;
}

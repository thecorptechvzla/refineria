import { PrismaService } from '../prisma/prisma.service';
import { CreateGoldBarDto } from './dto/create-gold-bar.dto';
import { UpdateGoldBarDto } from './dto/update-gold-bar.dto';
export declare class GoldBarsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateGoldBarDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationDate: Date;
        supplierId: string;
        code: string;
        grossWeight: number;
        ley: number | null;
        analytical: number;
        expected: number;
        recovered: number;
        available: boolean;
    }>;
    findAll(available?: string): import("../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        registrationDate: Date;
        supplierId: string;
        code: string;
        grossWeight: number;
        ley: number | null;
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
        ley: number | null;
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
        ley: number | null;
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
        ley: number | null;
        analytical: number;
        expected: number;
        recovered: number;
        available: boolean;
    }>;
}

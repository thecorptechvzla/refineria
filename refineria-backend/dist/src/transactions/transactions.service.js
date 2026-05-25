"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransactionsService = class TransactionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { type, supplierId, page = 1, limit = 20, startDate, endDate } = query;
        const where = {};
        if (type)
            where.type = type;
        if (supplierId)
            where.supplierId = supplierId;
        if (startDate || endDate) {
            where.date = {};
            if (startDate)
                where.date.gte = new Date(startDate);
            if (endDate)
                where.date.lte = new Date(endDate);
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.transaction.findMany({
                where,
                include: { supplier: { select: { name: true } } },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.transaction.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: { supplier: true },
        });
        if (!transaction) {
            throw new common_1.NotFoundException(`Transaction with id ${id} not found`);
        }
        return transaction;
    }
    create(dto, userId) {
        return this.prisma.transaction.create({
            data: {
                type: dto.type,
                weight: dto.weight,
                weightUnit: dto.weightUnit,
                purity: dto.purity,
                supplierId: dto.type === 'OUT' ? undefined : dto.supplierId,
            },
        });
    }
    async getMetrics() {
        const inTransactions = await this.prisma.transaction.findMany({
            where: { type: 'IN' },
        });
        const outTransactions = await this.prisma.transaction.findMany({
            where: { type: 'OUT' },
        });
        const inWeightGrams = inTransactions.reduce((sum, t) => {
            return sum + (t.weightUnit === 'kg' ? t.weight * 1000 : t.weight);
        }, 0);
        const outWeightGrams = outTransactions.reduce((sum, t) => {
            return sum + (t.weightUnit === 'kg' ? t.weight * 1000 : t.weight);
        }, 0);
        const balanceGrams = inWeightGrams - outWeightGrams;
        const [activeWorkers, totalWorkers] = await Promise.all([
            this.prisma.worker.count({ where: { status: 'active' } }),
            this.prisma.worker.count(),
        ]);
        return {
            totalIngresos: inWeightGrams,
            totalEgresos: outWeightGrams,
            balance: balanceGrams,
            workersActivos: activeWorkers,
            workersInactivos: totalWorkers - activeWorkers,
            workersTotal: totalWorkers,
        };
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.transaction.delete({ where: { id } });
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map
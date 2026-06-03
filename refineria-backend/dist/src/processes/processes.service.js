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
exports.ProcessesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProcessesService = class ProcessesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const count = await this.prisma.process.count();
        return this.prisma.process.create({
            data: {
                number: count + 1,
                supplierId: dto.supplierId,
            },
            include: { lots: true },
        });
    }
    findAll() {
        return this.prisma.process.findMany({
            orderBy: { createdAt: 'desc' },
            include: { lots: true },
        });
    }
    async findById(id) {
        const process = await this.prisma.process.findUnique({
            where: { id },
            include: { lots: true },
        });
        if (!process)
            throw new common_1.NotFoundException(`Process with id ${id} not found`);
        return process;
    }
    async update(id, dto) {
        await this.findById(id);
        const data = {};
        if (dto.status === 'closed') {
            data.closedAt = new Date();
        }
        if (dto.status) {
            data.status = dto.status;
        }
        const process = await this.prisma.process.update({
            where: { id },
            data,
            include: { lots: true },
        });
        if (dto.lots && dto.lots.length > 0) {
            for (const lot of dto.lots) {
                await this.prisma.processLot.update({
                    where: { id: lot.id },
                    data: { recovered: lot.recovered },
                });
            }
        }
        return this.prisma.process.findUnique({
            where: { id },
            include: { lots: true },
        });
    }
    async addLot(processId, dto) {
        const process = await this.findById(processId);
        if (process.status === 'closed') {
            throw new common_1.BadRequestException('Cannot add lot to a closed process');
        }
        const lotCount = await this.prisma.processLot.count({
            where: { processId },
        });
        const lot = await this.prisma.processLot.create({
            data: {
                processId,
                number: lotCount + 1,
                barIds: dto.barIds,
            },
        });
        await this.prisma.goldBar.updateMany({
            where: { id: { in: dto.barIds } },
            data: { available: false },
        });
        return lot;
    }
    async removeBarsFromLot(lotId, dto) {
        const lot = await this.prisma.processLot.findUnique({
            where: { id: lotId },
        });
        if (!lot)
            throw new common_1.NotFoundException(`Lot with id ${lotId} not found`);
        const remainingBarIds = lot.barIds.filter((bid) => !dto.barIds.includes(bid));
        await this.prisma.goldBar.updateMany({
            where: { id: { in: dto.barIds } },
            data: { available: true },
        });
        if (remainingBarIds.length === 0) {
            await this.prisma.processLot.delete({ where: { id: lotId } });
            return { deleted: true, lotId };
        }
        await this.prisma.processLot.update({
            where: { id: lotId },
            data: { barIds: remainingBarIds },
        });
        return { deleted: false, lotId };
    }
    async remove(id) {
        const process = await this.findById(id);
        const allBarIds = process.lots.flatMap((lot) => lot.barIds);
        if (allBarIds.length > 0) {
            await this.prisma.goldBar.updateMany({
                where: { id: { in: allBarIds } },
                data: { available: true },
            });
        }
        await this.prisma.process.delete({ where: { id } });
        return { deleted: true };
    }
};
exports.ProcessesService = ProcessesService;
exports.ProcessesService = ProcessesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProcessesService);
//# sourceMappingURL=processes.service.js.map
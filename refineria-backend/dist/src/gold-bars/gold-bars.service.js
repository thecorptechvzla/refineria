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
exports.GoldBarsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let GoldBarsService = class GoldBarsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(dto) {
        return this.prisma.goldBar.create({ data: dto });
    }
    findAll(available) {
        const where = available !== undefined
            ? { available: available === 'true' }
            : {};
        return this.prisma.goldBar.findMany({
            where,
            orderBy: { registrationDate: 'desc' },
        });
    }
    async findById(id) {
        const bar = await this.prisma.goldBar.findUnique({ where: { id } });
        if (!bar)
            throw new common_1.NotFoundException(`GoldBar with id ${id} not found`);
        return bar;
    }
    async update(id, dto) {
        await this.findById(id);
        return this.prisma.goldBar.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findById(id);
        return this.prisma.goldBar.delete({ where: { id } });
    }
};
exports.GoldBarsService = GoldBarsService;
exports.GoldBarsService = GoldBarsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoldBarsService);
//# sourceMappingURL=gold-bars.service.js.map
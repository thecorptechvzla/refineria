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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
const prisma_service_1 = require("../prisma/prisma.service");
let SuppliersService = class SuppliersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.supplier.findMany({
            orderBy: { registrationDate: 'desc' },
        });
    }
    async findById(id) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: { _count: { select: { transactions: true } } },
        });
        if (!supplier) {
            throw new common_1.NotFoundException(`Supplier with id ${id} not found`);
        }
        return supplier;
    }
    async create(dto) {
        try {
            return await this.prisma.supplier.create({ data: dto });
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new common_1.BadRequestException('El RIF ya está registrado por otro proveedor');
            }
            throw error;
        }
    }
    async update(id, dto) {
        await this.findById(id);
        return this.prisma.supplier.update({
            where: { id },
            data: dto,
        });
    }
    async remove(id) {
        const supplier = await this.prisma.supplier.findUnique({
            where: { id },
            include: { _count: { select: { transactions: true } } },
        });
        if (!supplier) {
            throw new common_1.NotFoundException(`Supplier with id ${id} not found`);
        }
        if (supplier._count.transactions > 0) {
            throw new common_1.ConflictException(`Cannot delete supplier with ${supplier._count.transactions} transaction(s)`);
        }
        return this.prisma.supplier.delete({ where: { id } });
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map
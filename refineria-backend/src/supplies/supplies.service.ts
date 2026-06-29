import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplyItemDto } from './dto/create-supply-item.dto';
import { UpdateSupplyItemDto } from './dto/update-supply-item.dto';
import { CreateSupplyTransactionDto } from './dto/create-supply-transaction.dto';

@Injectable()
export class SuppliesService {
  constructor(private readonly prisma: PrismaService) {}

  async createItem(dto: CreateSupplyItemDto) {
    const existing = await this.prisma.supplyItem.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Ya existe un insumo con el código "${dto.code}"`);
    }

    return this.prisma.supplyItem.create({
      data: {
        code: dto.code,
        name: dto.name,
        category: dto.category,
        unit: dto.unit ?? 'UNIDAD',
        criticalLevel: dto.criticalLevel ?? 1,
      },
    });
  }

  findAllItems(category?: string) {
    const where = category ? { category: category as any } : {};
    return this.prisma.supplyItem.findMany({
      where,
      orderBy: { code: 'asc' },
    });
  }

  async findItemById(id: string) {
    const item = await this.prisma.supplyItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Insumo con id ${id} no encontrado`);
    }
    return item;
  }

  async updateItem(id: string, dto: UpdateSupplyItemDto) {
    await this.findItemById(id);

    if (dto.code) {
      const existing = await this.prisma.supplyItem.findUnique({
        where: { code: dto.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Ya existe un insumo con el código "${dto.code}"`);
      }
    }

    return this.prisma.supplyItem.update({ where: { id }, data: dto });
  }

  async removeItem(id: string) {
    await this.findItemById(id);

    return this.prisma.supplyItem.delete({ where: { id } });
  }

  async createTransaction(dto: CreateSupplyTransactionDto) {
    const item = await this.prisma.supplyItem.findUnique({
      where: { id: dto.itemId },
    });
    if (!item) {
      throw new NotFoundException(`Insumo con id ${dto.itemId} no encontrado`);
    }

    if (dto.type === 'OUT' && item.currentStock < dto.quantity) {
      throw new BadRequestException(
        `Stock insuficiente. Stock actual: ${item.currentStock}, solicitado: ${dto.quantity}`,
      );
    }

    const delta = dto.type === 'IN' ? dto.quantity : -dto.quantity;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.supplyTransaction.create({
        data: {
          itemId: dto.itemId,
          type: dto.type,
          quantity: dto.quantity,
          reference: dto.reference,
        },
      }),
      this.prisma.supplyItem.update({
        where: { id: dto.itemId },
        data: { currentStock: { increment: delta } },
      }),
    ]);

    return transaction;
  }

  async getItemHistory(itemId: string) {
    await this.findItemById(itemId);

    return this.prisma.supplyTransaction.findMany({
      where: { itemId },
      orderBy: { date: 'desc' },
    });
  }
}

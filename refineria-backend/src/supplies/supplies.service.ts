import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSupplyItemDto } from './dto/create-supply-item.dto';
import { UpdateSupplyItemDto } from './dto/update-supply-item.dto';
import { CreateSupplyTransactionDto } from './dto/create-supply-transaction.dto';
import { CreateBulkSupplyTransactionDto } from './dto/create-bulk-supply-transaction.dto';
import { CriticalType, SupplyCategory } from '../generated/prisma/client';

@Injectable()
export class SuppliesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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
        isCritical: dto.isCritical ?? false,
        criticalType: dto.isCritical ? (dto.criticalType ?? null) : null,
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
    const oldStock = item.currentStock;
    const newStock = oldStock + delta;

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
        data: { currentStock: newStock },
      }),
    ]);

    await this.notificationsService.checkThresholdCross(
      dto.itemId,
      oldStock,
      newStock,
    );

    return transaction;
  }

  async createBulkTransaction(dto: CreateBulkSupplyTransactionDto) {
    // ---- Pre-validación de duplicados (items nuevos) ----
    const newItems = dto.items.filter((i) => dto.type === 'IN' && !i.itemId && i.name);

    if (newItems.length > 0) {
      // Layer A — nombres duplicados dentro del mismo lote
      const seen = new Set<string>();
      for (const item of newItems) {
        const key = item.name!.trim().toLowerCase();
        if (seen.has(key)) {
          throw new BadRequestException(
            `Error: El insumo "${item.name}" está duplicado dentro del mismo lote.`,
          );
        }
        seen.add(key);
      }

      // Layer B — nombres que ya existen en la base de datos
      const names = [...seen];
      const existing = await this.prisma.supplyItem.findMany({
        where: { name: { in: names, mode: 'insensitive' } },
        select: { name: true },
      });

      if (existing.length > 0) {
        throw new BadRequestException(
          `Error: Ya existe(n) insumo(s) con el mismo nombre: ${existing.map((e) => `"${e.name}"`).join(', ')}`,
        );
      }
    }

    const thresholdChecks: Array<() => Promise<void>> = [];

    await this.prisma.$transaction(async (tx) => {
      const transactions = [];

      for (const item of dto.items) {
        if (dto.type === 'OUT') {
          if (!item.itemId) {
            throw new BadRequestException(
              'Para descargos (OUT), cada fila debe seleccionar un insumo existente.',
            );
          }

          const supply = await tx.supplyItem.findUniqueOrThrow({
            where: { id: item.itemId },
          });

          const newStock = supply.currentStock - item.quantity;

          if (newStock < 0) {
            throw new BadRequestException(
              `Stock insuficiente para "${supply.name}". Stock actual: ${supply.currentStock}, requerido: ${item.quantity}`,
            );
          }

          await tx.supplyItem.update({
            where: { id: item.itemId },
            data: { currentStock: newStock },
          });

          transactions.push(
            await tx.supplyTransaction.create({
              data: {
                itemId: item.itemId,
                type: 'OUT',
                quantity: item.quantity,
                reference: dto.destination,
              },
            }),
          );

          thresholdChecks.push(() =>
            this.notificationsService.checkThresholdCross(
              item.itemId!,
              supply.currentStock,
              newStock,
            ),
          );
        } else {
          if (item.itemId) {
            const supply = await tx.supplyItem.findUniqueOrThrow({
              where: { id: item.itemId },
            });

            const newStock = supply.currentStock + item.quantity;

            await tx.supplyItem.update({
              where: { id: item.itemId },
              data: { currentStock: newStock },
            });

            transactions.push(
              await tx.supplyTransaction.create({
                data: {
                  itemId: item.itemId,
                  type: 'IN',
                  quantity: item.quantity,
                  reference: dto.destination,
                },
              }),
            );

            thresholdChecks.push(() =>
              this.notificationsService.checkThresholdCross(
                item.itemId!,
                supply.currentStock,
                newStock,
              ),
            );
          } else {
            if (!item.name || !item.category) {
              throw new BadRequestException(
                'Para crear un nuevo insumo, se requiere nombre y categoría.',
              );
            }

            const code = await this.generateCode(tx, item.category);
            const unit = item.unit ?? 'UNIDAD';
            const criticalLevel = item.criticalLevel ?? 1;

            const newItem = await tx.supplyItem.create({
              data: {
                code,
                name: item.name,
                category: item.category,
                unit,
                criticalLevel,
                isCritical: item.isCritical ?? false,
                criticalType: item.isCritical ? (item.criticalType ?? null) : null,
                currentStock: item.quantity,
              },
            });

            transactions.push(
              await tx.supplyTransaction.create({
                data: {
                  itemId: newItem.id,
                  type: 'IN',
                  quantity: item.quantity,
                  reference: dto.destination,
                },
              }),
            );
          }
        }
      }

      return transactions;
    });

    for (const check of thresholdChecks) {
      await check();
    }
  }

  private async generateCode(tx: any, category: SupplyCategory): Promise<string> {
    const prefix = category === 'OPERATIONS' ? 'OP' : category === 'CRITICAL' ? 'CR' : 'SG';
    const lastItem = await tx.supplyItem.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    const nextNum = lastItem ? parseInt(lastItem.code.slice(2), 10) + 1 : 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  async getItemHistory(itemId: string) {
    await this.findItemById(itemId);

    return this.prisma.supplyTransaction.findMany({
      where: { itemId },
      orderBy: { date: 'desc' },
    });
  }
}

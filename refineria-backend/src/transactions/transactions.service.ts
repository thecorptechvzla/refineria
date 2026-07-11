import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTransactionDto) {
    const {
      type,
      supplierId,
      page = 1,
      limit = 20,
      startDate,
      endDate,
    } = query;

    const where: any = {};

    if (type) where.type = type;
    if (supplierId) where.supplierId = supplierId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
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

  async findById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { supplier: true },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id ${id} not found`);
    }

    return transaction;
  }

  async create(dto: CreateTransactionDto, userId?: string) {
    if (dto.lotId && dto.type === 'OUT') {
      return this.createLotEgreso(dto.lotId);
    }

    return this.prisma.transaction.create({
      data: {
        type: dto.type,
        weight: dto.weight!,
        weightUnit: dto.weightUnit!,
        purity: dto.purity!,
        supplierId: dto.type === 'OUT' ? undefined : dto.supplierId,
      },
    });
  }

  private async createLotEgreso(lotId: string) {
    const lot = await this.prisma.processLot.findUnique({
      where: { id: lotId },
      include: {
        process: { select: { supplierId: true, status: true, number: true } },
      },
    });

    if (!lot) {
      throw new NotFoundException(`Lote con id ${lotId} no encontrado`);
    }

    if (lot.process.status !== 'closed') {
      throw new BadRequestException(
        'Solo lotes de procesos cerrados pueden egresarse',
      );
    }

    if (!lot.recovered) {
      throw new BadRequestException('El lote no tiene peso recuperado');
    }

    const available = lot.recovered - lot.egresadoG;
    if (available <= 0) {
      throw new BadRequestException('El lote ya fue egresado completamente');
    }

    const bars = await this.prisma.goldBar.findMany({
      where: { id: { in: lot.barIds } },
    });

    const avgPurity =
      bars.length > 0
        ? bars.reduce((sum, b) => {
            const p = b.grossWeight > 0 ? b.analytical / b.grossWeight : 0;
            return sum + p;
          }, 0) / bars.length
        : 0;

    const [transaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          type: 'OUT',
          weight: lot.recovered,
          weightUnit: 'g',
          purity: avgPurity,
          supplierId: lot.process.supplierId,
        },
      }),
      this.prisma.processLot.update({
        where: { id: lotId },
        data: { egresadoG: lot.recovered },
      }),
    ]);

    return transaction;
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

  async remove(id: string) {
    await this.findById(id);

    return this.prisma.transaction.delete({ where: { id } });
  }

  async update(id: string, dto: UpdateTransactionDto) {
    await this.findById(id);

    return this.prisma.transaction.update({ where: { id }, data: dto });
  }
}

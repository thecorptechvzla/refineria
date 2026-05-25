import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryTransactionDto) {
    const { type, supplierId, page = 1, limit = 20, startDate, endDate } = query;

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

  create(dto: CreateTransactionDto, userId?: string) {
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

  async remove(id: string) {
    await this.findById(id);

    return this.prisma.transaction.delete({ where: { id } });
  }
}

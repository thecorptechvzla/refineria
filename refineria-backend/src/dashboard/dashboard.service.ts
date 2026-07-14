import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics(supplierId?: string, startDate?: string, endDate?: string) {
    const dateRange = this.parseDateRange(startDate, endDate);

    const oroIngresado = await this.getOroIngresado(supplierId, dateRange);

    const [
      oroEnBoveda,
      oroEnProceso,
      faltaPorRefinar,
      processCounts,
      processSummary,
      supplierChartData,
      recentTransactions,
      totalBarCount,
      availableBarCount,
    ] = await Promise.all([
      this.getOroEnBoveda(supplierId, dateRange),
      this.getOroEnProceso(supplierId, dateRange),
      this.getOroPorProcesar(supplierId, dateRange, oroIngresado),
      this.getProcessCounts(supplierId, dateRange),
      this.getProcessSummary(supplierId, dateRange),
      this.getSupplierChartData(supplierId, dateRange),
      this.getRecentTransactions(supplierId, dateRange),
      this.getTotalBarCount(supplierId, dateRange),
      this.getAvailableBarCount(supplierId, dateRange),
    ]);

    return {
      oroIngresado,
      oroEnBoveda,
      oroEnProceso,
      faltaPorRefinar,
      totalBarCount,
      availableBarCount,
      processCounts,
      processSummary,
      supplierChartData,
      recentTransactions,
    };
  }

  private parseDateRange(startDate?: string, endDate?: string) {
    const range: { gte?: Date; lte?: Date } = {};
    if (startDate) range.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }
    return range;
  }

  private buildGoldBarWhere(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (dateRange?.gte || dateRange?.lte) {
      where.registrationDate = {};
      if (dateRange.gte) where.registrationDate.gte = dateRange.gte;
      if (dateRange.lte) where.registrationDate.lte = dateRange.lte;
    }
    return where;
  }

  private buildProcessWhere(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (dateRange?.gte || dateRange?.lte) {
      where.createdAt = {};
      if (dateRange.gte) where.createdAt.gte = dateRange.gte;
      if (dateRange.lte) where.createdAt.lte = dateRange.lte;
    }
    return where;
  }

  private buildTransactionWhere(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (dateRange?.gte || dateRange?.lte) {
      where.date = {};
      if (dateRange.gte) where.date.gte = dateRange.gte;
      if (dateRange.lte) where.date.lte = dateRange.lte;
    }
    return where;
  }

  private async getOroIngresado(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const result = await this.prisma.goldBar.aggregate({
      _sum: { grossWeight: true },
      where: this.buildGoldBarWhere(supplierId, dateRange),
    });
    return result._sum.grossWeight ?? 0;
  }

  private async getOroEnBoveda(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const processWhere: any = { status: 'closed' };
    if (supplierId) processWhere.supplierId = supplierId;
    if (dateRange?.gte || dateRange?.lte) {
      processWhere.createdAt = {};
      if (dateRange.gte) processWhere.createdAt.gte = dateRange.gte;
      if (dateRange.lte) processWhere.createdAt.lte = dateRange.lte;
    }

    const [recoveredResult, outTransactions] = await Promise.all([
      this.prisma.processLot.aggregate({
        _sum: { recovered: true },
        where: { process: processWhere },
      }),
      this.prisma.transaction.findMany({
        where: {
          type: 'OUT',
          ...this.buildTransactionWhere(supplierId, dateRange),
        },
      }),
    ]);

    const recovered = Number((recoveredResult._sum.recovered ?? 0).toFixed(2));
    const outFine = outTransactions.reduce((sum, tx) => {
      const grams = tx.weightUnit === 'kg' ? tx.weight * 1000 : tx.weight;
      return sum + grams * tx.purity;
    }, 0);
    return Number(Math.max(0, recovered - outFine).toFixed(2));
  }

  private async getOroPorProcesar(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
    oroIngresadoTotal?: number,
  ) {
    const allLots = await this.prisma.processLot.findMany({
      select: { barIds: true },
    });
    const allBarIds = [...new Set(allLots.flatMap((l) => l.barIds))];
    if (allBarIds.length === 0) return oroIngresadoTotal ?? 0;

    const result = await this.prisma.goldBar.aggregate({
      _sum: { grossWeight: true },
      where: {
        id: { in: allBarIds },
        ...this.buildGoldBarWhere(supplierId, dateRange),
      },
    });
    const enProcesos = result._sum.grossWeight ?? 0;
    return Number(Math.max(0, (oroIngresadoTotal ?? 0) - enProcesos).toFixed(2));
  }

  private async getOroEnProceso(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const inProgressLots = await this.prisma.processLot.findMany({
      where: { process: { status: { in: ['open', 'in_progress'] } } },
      select: { barIds: true },
    });
    const allBarIds = [...new Set(inProgressLots.flatMap((l) => l.barIds))];
    if (allBarIds.length === 0) return 0;

    const result = await this.prisma.goldBar.aggregate({
      _sum: { grossWeight: true },
      where: {
        id: { in: allBarIds },
        ...this.buildGoldBarWhere(supplierId, dateRange),
      },
    });
    return result._sum.grossWeight ?? 0;
  }

  private async getProcessCounts(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const where = this.buildProcessWhere(supplierId, dateRange);
    const counts = await this.prisma.process.groupBy({
      by: ['status'],
      _count: true,
      where,
    });
    const open = counts.find((c) => c.status === 'open')?._count ?? 0;
    const inProgress =
      counts.find((c) => c.status === 'in_progress')?._count ?? 0;
    const closed = counts.find((c) => c.status === 'closed')?._count ?? 0;
    return { open, inProgress, closed };
  }

  private async getProcessSummary(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const where = this.buildProcessWhere(supplierId, dateRange);
    const processes = await this.prisma.process.findMany({
      where,
      include: { lots: { select: { barIds: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return processes.map((p) => ({
      id: p.id,
      number: p.number,
      status: p.status,
      supplierId: p.supplierId,
      lotCount: p.lots.length,
      barCount: p.lots.reduce((sum, l) => sum + l.barIds.length, 0),
    }));
  }

  private async getSupplierChartData(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const supplierWhere = supplierId ? { id: supplierId } : {};
    const suppliers = await this.prisma.supplier.findMany({
      where: supplierWhere,
      select: { id: true, name: true },
    });

    const dateFilter =
      dateRange?.gte || dateRange?.lte
        ? {
            createdAt: {
              ...(dateRange.gte ? { gte: dateRange.gte } : {}),
              ...(dateRange.lte ? { lte: dateRange.lte } : {}),
            },
          }
        : {};

    const rows = await Promise.all(
      suppliers.map(async (s) => {
        // ── INGRESO BRUTO ──
        const ingresado = await this.getOroIngresado(s.id, dateRange);

        // ── RECUPERADO R — recovered from CLOSED processes ──
        const closedProcesses = await this.prisma.process.findMany({
          where: { supplierId: s.id, status: 'closed', ...dateFilter },
          select: { lots: { select: { recovered: true } } },
        });
        const recuperadoR = closedProcesses.reduce(
          (sum, p) =>
            sum + p.lots.reduce((s2, lot) => s2 + (lot.recovered ?? 0), 0),
          0,
        );

        // ── EGRESOS — OUT transactions ──
        const outTxns = await this.prisma.transaction.findMany({
          where: {
            type: 'OUT',
            supplierId: s.id,
            ...(dateRange?.gte || dateRange?.lte
              ? {
                  date: {
                    ...(dateRange.gte ? { gte: dateRange.gte } : {}),
                    ...(dateRange.lte ? { lte: dateRange.lte } : {}),
                  },
                }
              : {}),
          },
        });
        const egresos = outTxns.reduce((sum, tx) => {
          const grams = tx.weightUnit === 'kg' ? tx.weight * 1000 : tx.weight;
          return sum + grams * tx.purity;
        }, 0);

        // ── BALANCE ──
        const balance = Number((recuperadoR - egresos).toFixed(2));

        // ── KPI fields for bar chart (backward compat) ──
        const [boveda, proceso, porRefinar] = await Promise.all([
          this.getOroEnBoveda(s.id, dateRange),
          this.getOroEnProceso(s.id, dateRange),
          this.getOroPorProcesar(s.id, dateRange, ingresado),
        ]);

        return {
          id: s.id,
          name: s.name,
          ingresado: Number(ingresado.toFixed(2)),
          boveda: Number(boveda.toFixed(2)),
          proceso: Number(proceso.toFixed(2)),
          porRefinar: Number((porRefinar ?? 0).toFixed(2)),
          recuperadoR: Number(recuperadoR.toFixed(2)),
          egresos: Number(egresos.toFixed(2)),
          balance,
        };
      }),
    );

    return rows.filter(
      (r) =>
        r.ingresado > 0 ||
        r.boveda > 0 ||
        r.proceso > 0 ||
        r.porRefinar > 0 ||
        r.recuperadoR > 0 ||
        r.egresos > 0,
    );
  }

  private async getRecentTransactions(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    const where = this.buildTransactionWhere(supplierId, dateRange);
    return this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 8,
    });
  }

  private async getTotalBarCount(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    return this.prisma.goldBar.count({
      where: this.buildGoldBarWhere(supplierId, dateRange),
    });
  }

  private async getAvailableBarCount(
    supplierId?: string,
    dateRange?: { gte?: Date; lte?: Date },
  ) {
    return this.prisma.goldBar.count({
      where: {
        ...this.buildGoldBarWhere(supplierId, dateRange),
        available: true,
      },
    });
  }
}

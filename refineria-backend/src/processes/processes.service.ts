import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { CreateLotDto } from './dto/create-lot.dto';
import { RemoveBarsFromLotDto } from './dto/remove-bars-from-lot.dto';

@Injectable()
export class ProcessesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProcessDto) {
    const year = new Date().getFullYear();
    const counter = await this.prisma.processCounter.upsert({
      where: { supplierId: dto.supplierId },
      update: { seq: { increment: 1 } },
      create: { supplierId: dto.supplierId, seq: 1 },
    });
    return this.prisma.process.create({
      data: {
        number: String(counter.seq).padStart(7, '0'),
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

  async findById(id: string) {
    const process = await this.prisma.process.findUnique({
      where: { id },
      include: { lots: true },
    });
    if (!process)
      throw new NotFoundException(`Process with id ${id} not found`);
    return process;
  }

  async update(id: string, dto: UpdateProcessDto) {
    if (dto.lots && dto.lots.length > 0) {
      for (const lot of dto.lots) {
        await this.prisma.processLot.update({
          where: { id: lot.id },
          data: { recovered: lot.recovered },
        });
      }
    }

    const process = await this.findById(id);
    const data: any = {};

    if (dto.status === 'in_progress' && process.status !== 'open') {
      throw new BadRequestException(
        'Only open processes can be moved to in_progress',
      );
    }

    if (dto.status === 'closed') {
      if (process.status === 'open') {
        const lotsWithoutG = process.lots.filter((l) => l.recovered === null);
        if (lotsWithoutG.length > 0) {
          throw new BadRequestException(
            `Cannot close process. Lots ${lotsWithoutG.map((l) => l.number).join(', ')} have no recovered weight`,
          );
        }
      }
      data.closedAt = new Date();
    }

    if (dto.status) {
      data.status = dto.status;
    }

    await this.prisma.process.update({
      where: { id },
      data,
    });

    return this.prisma.process.findUnique({
      where: { id },
      include: { lots: true },
    });
  }

  async updateLot(lotId: string, dto: UpdateLotDto) {
    const lot = await this.prisma.processLot.findUnique({
      where: { id: lotId },
      include: { process: true },
    });
    if (!lot) throw new NotFoundException(`Lot with id ${lotId} not found`);

    const updateData: any = {};
    if (dto.recovered !== undefined) {
      updateData.recovered = dto.recovered;
    }

    if (dto.bars && dto.bars.length > 0) {
      for (const bar of dto.bars) {
        const goldBar = await this.prisma.goldBar.findUniqueOrThrow({
          where: { id: bar.barId },
          select: { grossWeight: true },
        });
        const analyticalAg = Number(
          ((goldBar.grossWeight * bar.leyAg) / 1000).toFixed(2),
        );
        await this.prisma.goldBar.update({
          where: { id: bar.barId },
          data: { leyAg: bar.leyAg, analyticalAg },
        });
      }
    }

    return this.prisma.processLot.update({
      where: { id: lotId },
      data: updateData,
    });
  }

  async addLot(processId: string, dto: CreateLotDto) {
    const process = await this.findById(processId);

    if (process.status !== 'open') {
      throw new BadRequestException(
        'Cannot add lot to a process that is not open',
      );
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

  async removeBarsFromLot(lotId: string, dto: RemoveBarsFromLotDto) {
    const lot = await this.prisma.processLot.findUnique({
      where: { id: lotId },
      include: { process: true },
    });
    if (!lot) throw new NotFoundException(`Lot with id ${lotId} not found`);

    if (lot.process.status !== 'open') {
      throw new BadRequestException(
        'Cannot remove bars from a lot in a process that is not open',
      );
    }

    const remainingBarIds = lot.barIds.filter(
      (bid) => !dto.barIds.includes(bid),
    );

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

  async remove(id: string) {
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

  async removeAll() {
    const allProcesses = await this.prisma.process.findMany({
      include: { lots: true },
    });

    const allBarIds = allProcesses.flatMap((p) =>
      p.lots.flatMap((l) => l.barIds),
    );
    if (allBarIds.length > 0) {
      await this.prisma.goldBar.updateMany({
        where: { id: { in: allBarIds } },
        data: { available: true },
      });
    }

    const allLotIds = allProcesses.flatMap((p) => p.lots.map((l) => l.id));
    if (allLotIds.length > 0) {
      await this.prisma.processLot.deleteMany({
        where: { id: { in: allLotIds } },
      });
    }

    await this.prisma.processCounter.deleteMany({});
    await this.prisma.process.deleteMany({});
    return { deleted: true };
  }

  async findClosedBySupplier(supplierId: string) {
    return this.prisma.process.findMany({
      where: { supplierId, status: 'closed' },
      orderBy: { createdAt: 'desc' },
      include: {
        lots: {
          orderBy: { number: 'asc' },
        },
      },
    });
  }

  async updateActasUrls(
    id: string,
    actas: {
      actaRecepcion?: string | null;
      actaFundicion?: string | null;
      actaConformidad?: string | null;
    },
  ) {
    const data: Record<string, string | null> = {};
    if (actas.actaRecepcion !== undefined)
      data.actaRecepcion = actas.actaRecepcion;
    if (actas.actaFundicion !== undefined)
      data.actaFundicion = actas.actaFundicion;
    if (actas.actaConformidad !== undefined)
      data.actaConformidad = actas.actaConformidad;

    return this.prisma.process.update({
      where: { id },
      data,
      include: { lots: true },
    });
  }

  async closeWithActas(
    id: string,
    actas: {
      actaRecepcion: string;
      actaFundicion: string;
      actaConformidad: string;
    },
  ) {
    const process = await this.findById(id);

    if (process.status !== 'in_progress' && process.status !== 'open') {
      throw new BadRequestException(
        'Solo procesos abiertos o en progreso pueden cerrarse con actas',
      );
    }

    const lotsWithoutG = process.lots.filter((l) => l.recovered === null);
    if (lotsWithoutG.length > 0) {
      throw new BadRequestException(
        `Cannot close process. Lots ${lotsWithoutG.map((l) => l.number).join(', ')} have no recovered weight`,
      );
    }

    return this.prisma.process.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
        actaRecepcion: actas.actaRecepcion,
        actaFundicion: actas.actaFundicion,
        actaConformidad: actas.actaConformidad,
      },
      include: { lots: true },
    });
  }

  async findDetail(id: string) {
    const process = await this.prisma.process.findUnique({
      where: { id },
      include: { lots: { orderBy: { number: 'asc' } } },
    });
    if (!process)
      throw new NotFoundException(`Process with id ${id} not found`);

    const allBarIds = [...new Set(process.lots.flatMap((l) => l.barIds))];
    const bars =
      allBarIds.length > 0
        ? await this.prisma.goldBar.findMany({
            where: { id: { in: allBarIds } },
          })
        : [];
    const barMap = new Map(bars.map((b) => [b.id, b]));

    return {
      ...process,
      lotDetails: process.lots.map((lot) => ({
        ...lot,
        bars: lot.barIds
          .map((id) => barMap.get(id))
          .filter((b): b is NonNullable<typeof b> => b != null),
      })),
    };
  }
}

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
    const count = await this.prisma.process.count();
    return this.prisma.process.create({
      data: {
        number: String(count + 1).padStart(7, '0'),
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
    if (!process) throw new NotFoundException(`Process with id ${id} not found`);
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
      throw new BadRequestException('Only open processes can be moved to in_progress');
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

    return this.prisma.processLot.update({
      where: { id: lotId },
      data: { recovered: dto.recovered },
    });
  }

  async addLot(processId: string, dto: CreateLotDto) {
    const process = await this.findById(processId);

    if (process.status !== 'open') {
      throw new BadRequestException('Cannot add lot to a process that is not open');
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
      throw new BadRequestException('Cannot remove bars from a lot in a process that is not open');
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
}

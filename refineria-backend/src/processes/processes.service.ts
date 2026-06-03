import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { CreateLotDto } from './dto/create-lot.dto';
import { RemoveBarsFromLotDto } from './dto/remove-bars-from-lot.dto';

@Injectable()
export class ProcessesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProcessDto) {
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

  async findById(id: string) {
    const process = await this.prisma.process.findUnique({
      where: { id },
      include: { lots: true },
    });
    if (!process) throw new NotFoundException(`Process with id ${id} not found`);
    return process;
  }

  async update(id: string, dto: UpdateProcessDto) {
    await this.findById(id);
    const data: any = {};
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

  async addLot(processId: string, dto: CreateLotDto) {
    const process = await this.findById(processId);

    if (process.status === 'closed') {
      throw new BadRequestException('Cannot add lot to a closed process');
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
    });
    if (!lot) throw new NotFoundException(`Lot with id ${lotId} not found`);

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
}

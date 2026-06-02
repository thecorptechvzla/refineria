import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { CreateLotDto } from './dto/create-lot.dto';

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
    return this.prisma.process.update({
      where: { id },
      data: {
        ...(dto.status === 'closed' ? { closedAt: new Date() } : {}),
        status: dto.status,
      },
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

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.process.delete({ where: { id } });
  }
}

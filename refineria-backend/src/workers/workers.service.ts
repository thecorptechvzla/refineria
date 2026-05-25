import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.worker.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string) {
    const worker = await this.prisma.worker.findUnique({ where: { id } });

    if (!worker) {
      throw new NotFoundException(`Worker with id ${id} not found`);
    }

    return worker;
  }

  create(dto: CreateWorkerDto) {
    return this.prisma.worker.create({
      data: {
        name: dto.name,
        position: dto.position,
        status: dto.status,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
      },
    });
  }

  async update(id: string, dto: UpdateWorkerDto) {
    await this.findById(id);

    const data: any = { ...dto };
    if (dto.startDate) {
      data.startDate = new Date(dto.startDate);
    }

    return this.prisma.worker.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findById(id);

    return this.prisma.worker.delete({ where: { id } });
  }
}

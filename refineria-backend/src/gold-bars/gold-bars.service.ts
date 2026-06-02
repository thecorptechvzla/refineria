import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoldBarDto } from './dto/create-gold-bar.dto';
import { UpdateGoldBarDto } from './dto/update-gold-bar.dto';

@Injectable()
export class GoldBarsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateGoldBarDto) {
    return this.prisma.goldBar.create({ data: dto });
  }

  findAll(available?: string) {
    const where = available !== undefined
      ? { available: available === 'true' }
      : {};
    return this.prisma.goldBar.findMany({
      where,
      orderBy: { registrationDate: 'desc' },
    });
  }

  async findById(id: string) {
    const bar = await this.prisma.goldBar.findUnique({ where: { id } });
    if (!bar) throw new NotFoundException(`GoldBar with id ${id} not found`);
    return bar;
  }

  async update(id: string, dto: UpdateGoldBarDto) {
    await this.findById(id);
    return this.prisma.goldBar.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.goldBar.delete({ where: { id } });
  }
}

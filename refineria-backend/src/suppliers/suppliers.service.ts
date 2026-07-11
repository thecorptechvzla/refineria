import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CustomFieldsService } from '../custom-fields/custom-fields.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly customFields: CustomFieldsService,
  ) {}

  async findAll() {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { registrationDate: 'desc' },
    });
    return this.customFields.mergeCustomFields('suppliers', suppliers);
  }

  async findById(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    const [merged] = await this.customFields.mergeCustomFields('suppliers', [
      supplier,
    ]);
    return merged;
  }

  async getImpact(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
            goldBars: true,
            processes: true,
          },
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return {
      supplierName: supplier.name,
      transactions: supplier._count.transactions,
      goldBars: supplier._count.goldBars,
      processes: supplier._count.processes,
    };
  }

  async create(dto: CreateSupplierDto, _customFields?: Record<string, string>) {
    try {
      const supplier = await this.prisma.supplier.create({ data: dto });

      if (_customFields) {
        await this.customFields.setValues(
          'suppliers',
          supplier.id,
          _customFields,
        );
      }

      const [merged] = await this.customFields.mergeCustomFields('suppliers', [
        supplier,
      ]);
      return merged;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'El RIF ya está registrado por otro proveedor',
        );
      }
      throw error;
    }
  }

  async update(
    id: string,
    dto: UpdateSupplierDto,
    _customFields?: Record<string, string>,
  ) {
    await this.findById(id);

    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });

    if (_customFields) {
      await this.customFields.setValues('suppliers', id, _customFields);
    }

    const [merged] = await this.customFields.mergeCustomFields('suppliers', [
      supplier,
    ]);
    return merged;
  }

  async remove(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return this.prisma.supplier.delete({ where: { id } });
  }
}

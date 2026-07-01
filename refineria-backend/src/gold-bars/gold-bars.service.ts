import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoldBarDto } from './dto/create-gold-bar.dto';
import { UpdateGoldBarDto } from './dto/update-gold-bar.dto';
import * as ExcelJS from 'exceljs';

export interface BulkResult {
  created: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

@Injectable()
export class GoldBarsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGoldBarDto) {
    const data = { ...dto, recovered: dto.recovered ?? 0 };
    return this.prisma.goldBar.create({ data });
  }

  async bulkCreate(file: Express.Multer.File, supplierId: string): Promise<BulkResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const sheet = workbook.worksheets[0];

    if (!sheet) {
      throw new BadRequestException('El archivo Excel no contiene hojas de cálculo');
    }

    const result: BulkResult = { created: 0, skipped: 0, errors: [] };
    const barsToCreate: CreateGoldBarDto[] = [];
    const codeRowMap = new Map<string, number>();

    for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const nVal = row.getCell(1).value;
      if (nVal == null || nVal === '') continue;

      const code = String(nVal).trim();
      if (!code || /^(TOTAL|RESUMEN|SUBTOTAL|SUM|total|resumen)$/i.test(code)) continue;

      // Layer A — duplicados dentro del archivo
      if (codeRowMap.has(code)) {
        throw new BadRequestException(
          `Error: El código "${code}" está duplicado en la fila ${rowNumber} del archivo (primera aparición: fila ${codeRowMap.get(code)})`,
        );
      }
      codeRowMap.set(code, rowNumber);

      const grossWeight = this.parseNumericCell(row.getCell(2));
      if (grossWeight == null || grossWeight <= 0) {
        result.errors.push({ row: rowNumber, message: `Peso bruto inválido en fila ${rowNumber}` });
        continue;
      }

      const ley = this.parseNumericCell(row.getCell(3));
      if (ley == null || ley <= 0) {
        result.errors.push({ row: rowNumber, message: `LEY Au inválida en fila ${rowNumber}` });
        continue;
      }

      const analytical = Number((grossWeight * ley / 1000).toFixed(2));
      const expected = analytical * 0.99;

      const lotVal = row.getCell(5).value;
      const originalLot = lotVal != null ? String(lotVal).trim() : undefined;

      barsToCreate.push({
        code,
        supplierId,
        grossWeight,
        ley,
        analytical,
        expected,
        recovered: 0,
        originalLot: originalLot || undefined,
      });
    }

    if (barsToCreate.length === 0) {
      throw new BadRequestException('No se encontraron barras válidas en el archivo');
    }
    const prismaData = barsToCreate.map((b) => ({
      code: b.code,
      supplierId: b.supplierId,
      grossWeight: b.grossWeight,
      ley: b.ley,
      analytical: b.analytical,
      expected: b.expected,
      recovered: 0,
      originalLot: b.originalLot,
    }));

    const resultCreate = await this.prisma.goldBar.createMany({ data: prismaData });

    const totalWeight = barsToCreate.reduce((s, b) => s + b.grossWeight, 0);
    const totalAnalytical = barsToCreate.reduce((s, b) => s + b.analytical, 0);
    const avgPurity = totalWeight > 0 ? totalAnalytical / totalWeight : 0;

    await this.prisma.transaction.create({
      data: {
        type: 'IN',
        weight: totalWeight,
        weightUnit: 'g',
        purity: avgPurity,
        supplierId,
      },
    });

    result.created = resultCreate.count;
    return result;
  }

  private parseNumericCell(cell: ExcelJS.Cell): number | null {
    if (cell.result != null && typeof cell.result === 'number') return cell.result;
    if (cell.value != null) {
      const val = cell.value;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const parsed = parseFloat(val.replace(',', '.'));
        return isNaN(parsed) ? null : parsed;
      }
    }
    return null;
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

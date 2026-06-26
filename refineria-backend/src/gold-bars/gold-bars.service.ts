import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const existing = await this.prisma.goldBar.findFirst({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Ya existe una barra con el código "${dto.code}"`);
    }
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

    for (let rowNumber = 3; rowNumber <= sheet.rowCount; rowNumber++) {
      const row = sheet.getRow(rowNumber);

      const nVal = row.getCell(8).value;
      if (nVal == null || nVal === '') continue;

      const code = String(nVal).trim();
      if (!code || /^(TOTAL|RESUMEN|SUBTOTAL|SUM|total|resumen)$/i.test(code)) continue;

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

      const leyAg = this.parseNumericCell(row.getCell(6));
      const analyticalAg = leyAg != null && leyAg > 0 ? grossWeight * leyAg / 1000 : undefined;

      barsToCreate.push({
        code,
        supplierId,
        grossWeight,
        ley,
        analytical,
        expected,
        recovered: 0,
        leyAg: leyAg ?? undefined,
        analyticalAg,
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
      leyAg: b.leyAg,
      analyticalAg: b.analyticalAg,
    }));

    const resultCreate = await this.prisma.goldBar.createMany({
      data: prismaData,
      skipDuplicates: true,
    });

    result.created = resultCreate.count;
    result.skipped = barsToCreate.length - resultCreate.count;

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

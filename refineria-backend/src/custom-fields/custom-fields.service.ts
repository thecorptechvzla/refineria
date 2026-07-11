import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomFieldsService {
  constructor(private readonly prisma: PrismaService) {}

  getDefinitions(tableName: string) {
    return this.prisma.customFieldDefinition.findMany({
      where: { tableName },
      orderBy: { order: 'asc' },
    });
  }

  async createDefinition(data: {
    tableName: string;
    fieldName: string;
    fieldType: string;
    required?: boolean;
    options?: string;
  }) {
    const count = await this.prisma.customFieldDefinition.count({
      where: { tableName: data.tableName },
    });

    return this.prisma.customFieldDefinition.create({
      data: {
        tableName: data.tableName,
        fieldName: data.fieldName,
        fieldType: data.fieldType,
        required: data.required ?? false,
        options: data.options,
        order: count,
      },
    });
  }

  async deleteDefinition(id: string) {
    const def = await this.prisma.customFieldDefinition.findUnique({
      where: { id },
    });
    if (!def) throw new NotFoundException('Field definition not found');

    await this.prisma.customFieldDefinition.delete({ where: { id } });
  }

  async getValues(tableName: string, recordId: string) {
    const values = await this.prisma.customFieldValue.findMany({
      where: { tableName, recordId },
      include: { field: true },
    });

    const result: Record<string, string | null> = {};
    for (const v of values) {
      result[v.field.fieldName] = v.value;
    }
    return result;
  }

  async setValues(
    tableName: string,
    recordId: string,
    fields: Record<string, string>,
  ) {
    const definitions = await this.prisma.customFieldDefinition.findMany({
      where: { tableName },
    });

    const defMap = new Map(definitions.map((d) => [d.fieldName, d.id]));

    await this.prisma.customFieldValue.deleteMany({
      where: { tableName, recordId },
    });

    if (Object.keys(fields).length === 0) return;

    await this.prisma.customFieldValue.createMany({
      data: Object.entries(fields)
        .filter(([key]) => defMap.has(key))
        .map(([key, value]) => ({
          tableName,
          recordId,
          fieldId: defMap.get(key)!,
          value: value ?? '',
        })),
    });
  }

  async mergeCustomFields<T extends { id: string }>(
    tableName: string,
    records: T[],
  ): Promise<(T & { _customFields: Record<string, string | null> })[]> {
    if (records.length === 0) return [];

    const recordIds = records.map((r) => r.id);

    const values = await this.prisma.customFieldValue.findMany({
      where: { tableName, recordId: { in: recordIds } },
      include: { field: true },
    });

    const valuesByRecord: Record<string, Record<string, string | null>> = {};
    for (const v of values) {
      if (!valuesByRecord[v.recordId]) valuesByRecord[v.recordId] = {};
      valuesByRecord[v.recordId][v.field.fieldName] = v.value;
    }

    return records.map((r) => ({
      ...r,
      _customFields: valuesByRecord[r.id] ?? {},
    }));
  }
}

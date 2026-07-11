import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead() {
    await this.prisma.notification.updateMany({
      data: { read: true },
    });
  }

  async getUnreadCount() {
    return this.prisma.notification.count({
      where: { read: false },
    });
  }

  async checkThresholdCross(
    itemId: string,
    oldStock: number,
    newStock: number,
  ) {
    const item = await this.prisma.supplyItem.findUnique({
      where: { id: itemId },
    });
    if (!item) return;

    const crossed =
      oldStock > item.criticalLevel && newStock <= item.criticalLevel;

    if (!crossed) return;

    const title = 'Stock Crítico';
    const message = `"${item.name}" (${item.code}) — Stock: ${newStock} ud (mínimo: ${item.criticalLevel})`;

    await this.createNotification({ type: 'CRITICAL_STOCK', title, message });
    await this.sendTelegram(`${title}\n${message}`);
  }

  async createNotification(data: {
    type: string;
    title: string;
    message: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async generateDailySummary() {
    const items = await this.prisma.supplyItem.findMany();
    const critical = items.filter((i) => i.currentStock <= i.criticalLevel);

    if (critical.length === 0) return;

    const message = critical
      .map(
        (i) =>
          `• ${i.name} (${i.code}): ${i.currentStock} ud — mínimo: ${i.criticalLevel}`,
      )
      .join('\n');

    const title = `Resumen Diario — ${critical.length} insumo(s) crítico(s)`;

    await this.createNotification({ type: 'CRITICAL_STOCK', title, message });
    await this.sendTelegram(`${title}\n\n${message}`);
  }

  private async sendTelegram(text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados. Mensaje no enviado.',
      );
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: Number(chatId),
          text,
          parse_mode: 'HTML',
        }),
      });
      this.logger.log('Telegram notification sent');
    } catch (err) {
      this.logger.error('Failed to send Telegram notification', err);
    }
  }
}

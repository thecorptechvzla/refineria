import {
  Controller,
  Get,
  Patch,
  Param,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../common/guards/roles.guard';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async findAll() {
    return this.notificationsService.findAll();
  }

  @Get('notifications/unread-count')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async getUnreadCount() {
    const count = await this.notificationsService.getUnreadCount();
    return { count };
  }

  @Patch('notifications/:id/read')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('notifications/read-all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async markAllAsRead() {
    await this.notificationsService.markAllAsRead();
    return { ok: true };
  }

  @Get('cron/daily-summary')
  async triggerDailySummary(
    @Headers('authorization') auth: string,
  ) {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
      throw new UnauthorizedException('CRON_SECRET no configurado');
    }

    if (!auth || auth !== `Bearer ${secret}`) {
      throw new UnauthorizedException('CRON_SECRET inválido');
    }

    await this.notificationsService.generateDailySummary();
    return { ok: true };
  }
}

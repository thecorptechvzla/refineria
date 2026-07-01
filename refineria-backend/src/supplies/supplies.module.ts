import { Module } from '@nestjs/common';
import { SuppliesController } from './supplies.controller';
import { SuppliesService } from './supplies.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [SuppliesController],
  providers: [SuppliesService],
})
export class SuppliesModule {}

import { Module } from '@nestjs/common';
import { GoldBarsController } from './gold-bars.controller';
import { GoldBarsService } from './gold-bars.service';

@Module({
  controllers: [GoldBarsController],
  providers: [GoldBarsService],
})
export class GoldBarsModule {}

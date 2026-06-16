import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { CustomFieldsModule } from '../custom-fields/custom-fields.module';

@Module({
  imports: [CustomFieldsModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}

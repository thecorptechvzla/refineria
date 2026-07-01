import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { WorkersModule } from './workers/workers.module';
import { GoldBarsModule } from './gold-bars/gold-bars.module';
import { ProcessesModule } from './processes/processes.module';
import { FilesModule } from './files/files.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { SuppliesModule } from './supplies/supplies.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    SuppliersModule,
    TransactionsModule,
    WorkersModule,
    GoldBarsModule,
    ProcessesModule,
    FilesModule,
    CustomFieldsModule,
    SuppliesModule,
    NotificationsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IoTModule } from './modules/iot/iot.module';

@Module({
  imports: [
    // Config — load .env globally
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Core infrastructure
    PrismaModule,
    NotificationsModule,

    // Domain modules
    AuthModule,
    UsersModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    PaymentsModule,
    LogisticsModule,

    // IoT (Phase 1 Stub → Phase 2 InfluxDB)
    IoTModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

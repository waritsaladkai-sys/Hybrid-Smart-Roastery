import { Module } from '@nestjs/common';
import { IoTController } from './iot.controller';
import { IoTService } from './iot.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IoTController],
  providers: [IoTService],
  exports: [IoTService],
})
export class IoTModule {}

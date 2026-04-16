import { Controller, Get, Post, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IoTService } from './iot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// ────────────────────────────────────────────────────────────
// DTOs
// ────────────────────────────────────────────────────────────
export class SensorReadingDto {
  deviceId: string;        // e.g. "RPi5-LoadCell-01"
  sensorType: 'weight' | 'temperature' | 'humidity';
  value: number;           // raw value
  unit: string;            // kg, °C, %
  timestamp?: string;      // ISO 8601, defaults to server time
}

export class RoastEventDto {
  roastJobId: string;
  eventType: 'CHARGE' | 'DRY_END' | 'FC_START' | 'FC_END' | 'SC_START' | 'DROP';
  beanTemp: number;          // °C
  drumTemp?: number;         // °C
  heatSetting?: number;      // 0-100%
  airflowSetting?: number;   // 0-100%
  roastTimeSeconds: number;
}

// ────────────────────────────────────────────────────────────
// Controller
// ────────────────────────────────────────────────────────────
@ApiTags('IoT')
@Controller('api/v1/iot')
export class IoTController {
  constructor(private readonly iotService: IoTService) {}

  /**
   * POST /api/v1/iot/sensor
   * Receive raw sensor data from Raspberry Pi GPIO / Load Cell
   */
  @Post('sensor')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive sensor reading (weight, temp, humidity)' })
  async receiveSensorReading(@Body() dto: SensorReadingDto) {
    return this.iotService.processSensorReading(dto);
  }

  /**
   * POST /api/v1/iot/roast-event
   * Receive roast profile events (CHARGE, DRY_END, FCstart, DROP, etc.)
   * Called by Artisan or custom firmware
   */
  @Post('roast-event')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive roast profile event from Artisan / firmware' })
  async receiveRoastEvent(@Body() dto: RoastEventDto) {
    return this.iotService.processRoastEvent(dto);
  }

  /**
   * GET /api/v1/iot/devices
   * List all registered IoT devices
   */
  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List registered IoT devices' })
  async getDevices() {
    return this.iotService.getDevices();
  }

  /**
   * GET /api/v1/iot/sensor/latest/:deviceId
   * Latest reading from a device
   */
  @Get('sensor/latest/:deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get latest sensor reading for device' })
  async getLatestReading(@Param('deviceId') deviceId: string) {
    return this.iotService.getLatestReading(deviceId);
  }

  /**
   * GET /api/v1/iot/status
   * Health status of all devices (for dashboard)
   */
  @Get('status')
  @ApiOperation({ summary: 'IoT system health status' })
  async getStatus() {
    return this.iotService.getSystemStatus();
  }
}

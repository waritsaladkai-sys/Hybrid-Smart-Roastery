import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SensorReadingDto, RoastEventDto } from './iot.controller';

// ────────────────────────────────────────────────────────────
// In-memory store for latest readings (Phase 1 — Stub)
// Phase 2: migrate to InfluxDB / TimescaleDB
// ────────────────────────────────────────────────────────────
interface DeviceState {
  deviceId: string;
  sensorType: string;
  value: number;
  unit: string;
  receivedAt: Date;
  online: boolean;
}

@Injectable()
export class IoTService {
  private readonly logger = new Logger(IoTService.name);
  private deviceStore = new Map<string, DeviceState>();
  private roastEvents: (RoastEventDto & { receivedAt: Date })[] = [];

  // Registered devices (Phase 2: persist to DB)
  private readonly REGISTERED_DEVICES = [
    { deviceId: 'RPi5-LoadCell-01', type: 'weight', description: 'Green Bean Load Cell — Hopper', location: 'Roastery' },
    { deviceId: 'RPi5-Temp-01', type: 'temperature', description: 'Ambient Temperature Sensor', location: 'Storage Room' },
    { deviceId: 'RPi5-Humid-01', type: 'humidity', description: 'Humidity Sensor — Storage', location: 'Storage Room' },
    { deviceId: 'Artisan-Probe-01', type: 'roast_profile', description: 'Artisan Roast Logging Bridge', location: 'Roaster Machine' },
  ];

  constructor(private prisma: PrismaService) {}

  // ── Sensor Reading ────────────────────────────────────────
  async processSensorReading(dto: SensorReadingDto) {
    const state: DeviceState = {
      deviceId: dto.deviceId,
      sensorType: dto.sensorType,
      value: dto.value,
      unit: dto.unit,
      receivedAt: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      online: true,
    };

    this.deviceStore.set(dto.deviceId, state);
    this.logger.log(`📡 [${dto.deviceId}] ${dto.sensorType}: ${dto.value}${dto.unit}`);

    // Weight threshold check: auto-update GreenBeanInventory if load cell data
    if (dto.sensorType === 'weight' && dto.deviceId.includes('LoadCell')) {
      await this.checkWeightThreshold(dto.value);
    }

    return {
      received: true,
      deviceId: dto.deviceId,
      processedAt: state.receivedAt.toISOString(),
      value: dto.value,
      unit: dto.unit,
    };
  }

  // ── Roast Event (from Artisan / firmware) ─────────────────
  async processRoastEvent(dto: RoastEventDto) {
    const event = { ...dto, receivedAt: new Date() };
    this.roastEvents.push(event);

    this.logger.log(
      `🔥 RoastJob[${dto.roastJobId}] Event: ${dto.eventType} ` +
      `BT:${dto.beanTemp}°C at ${dto.roastTimeSeconds}s`
    );

    // Phase 2: Update RoastJob record in DB with drop temp on DROP event
    if (dto.eventType === 'DROP') {
      try {
        await this.prisma.roastJob.update({
          where: { id: dto.roastJobId },
          data: {
            dropTemp: dto.beanTemp,
            roastTimeSec: dto.roastTimeSeconds,
            status: 'DROPPED',
          },
        }).catch(() => {
          // RoastJob may not exist yet, log and continue
          this.logger.warn(`RoastJob ${dto.roastJobId} not found in DB — skipping update`);
        });
      } catch (_) {}
    }

    return {
      received: true,
      roastJobId: dto.roastJobId,
      eventType: dto.eventType,
      processedAt: event.receivedAt.toISOString(),
    };
  }

  // ── Device List ───────────────────────────────────────────
  getDevices() {
    return this.REGISTERED_DEVICES.map((d) => {
      const state = this.deviceStore.get(d.deviceId);
      const isOnline = state
        ? (new Date().getTime() - state.receivedAt.getTime()) < 5 * 60 * 1000 // 5 min
        : false;
      return { ...d, online: isOnline, lastSeen: state?.receivedAt ?? null, lastValue: state ? `${state.value}${state.unit}` : null };
    });
  }

  // ── Latest Reading ───────────────────────────────────────
  getLatestReading(deviceId: string) {
    const state = this.deviceStore.get(deviceId);
    if (!state) return { deviceId, online: false, message: 'No data received yet' };
    return { ...state, online: (new Date().getTime() - state.receivedAt.getTime()) < 5 * 60 * 1000 };
  }

  // ── System Status ──────────────────────────────────────────
  getSystemStatus() {
    const devices = this.getDevices();
    const onlineCount = devices.filter(d => d.online).length;
    return {
      status: onlineCount === devices.length ? 'healthy' : onlineCount > 0 ? 'degraded' : 'offline',
      totalDevices: devices.length,
      onlineDevices: onlineCount,
      offlineDevices: devices.length - onlineCount,
      phase: 'Phase 1 (Stub) — Phase 2 will add InfluxDB',
      devices,
      recentRoastEvents: this.roastEvents.slice(-10).reverse(),
    };
  }

  // ── Private Helpers ──────────────────────────────────────
  private async checkWeightThreshold(weightKg: number) {
    // Load cell reading < alert threshold → trigger notification (Phase 2: LINE alert)
    this.logger.log(`⚖️ Load cell weight: ${weightKg}kg`);
  }
}

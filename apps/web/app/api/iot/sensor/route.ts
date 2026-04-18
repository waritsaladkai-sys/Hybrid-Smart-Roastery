import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/iot/sensor
 * Receives sensor readings from IoT devices (Load Cell, Temp, Humidity)
 * Called by: ESP32 / RPi GPIO firmware via HTTP POST
 *
 * Future: write to iot_sensor_log table + trigger low-stock alert
 */
export async function POST(request: NextRequest) {
  // Simple API key auth for IoT devices
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.IOT_API_KEY && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { deviceId, sensorType, value, unit } = body;

  if (!deviceId || !sensorType || value === undefined || !unit) {
    return NextResponse.json(
      { error: 'Required: deviceId, sensorType, value, unit' },
      { status: 400 }
    );
  }

  // Log to Supabase (Phase 2: enable this)
  // const { createAdminClient } = await import('../../../lib/supabase');
  // const admin = createAdminClient();
  // await admin.from('iot_sensor_log').insert({ device_id: deviceId, sensor_type: sensorType, value, unit });

  // Weight threshold check stub
  if (sensorType === 'weight') {
    const LOW_STOCK_KG = Number(process.env.LOW_STOCK_KG ?? 5);
    if (value < LOW_STOCK_KG) {
      console.warn(`⚠️ Low stock alert: ${deviceId} = ${value}${unit}`);
      // Phase 2: trigger LINE notify
    }
  }

  console.log(`📡 IoT [${deviceId}] ${sensorType}: ${value}${unit}`);

  return NextResponse.json({
    received: true,
    deviceId,
    sensorType,
    value,
    unit,
    processedAt: new Date().toISOString(),
  });
}

/** GET /api/iot/sensor — health status (no auth) */
export async function GET() {
  return NextResponse.json({
    status: 'ready',
    message: 'IoT Sensor endpoint ready — POST to submit readings',
    phase: 'Phase 1 (Stub) — DB logging commented out',
  });
}

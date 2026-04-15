import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Process } from '@prisma/client';

export class CreateGreenBeanDto {
  @ApiProperty({ example: 'ETH-LOT-2026-001' })
  @IsString()
  batchRef: string;

  @ApiProperty({ example: 'Ethiopia' })
  @IsString()
  origin: string;

  @ApiPropertyOptional({ example: 'Yirgacheffe' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ enum: Process })
  @IsEnum(Process)
  process: Process;

  @ApiProperty({ example: 11.5, description: 'ความชื้น (%)' })
  @IsNumber()
  @Min(8)
  @Max(14)
  moisturePercent: number;

  @ApiProperty({ example: 60, description: 'น้ำหนักรับเข้า (กิโลกรัม)' })
  @IsNumber()
  @IsPositive()
  weightKg: number;

  @ApiPropertyOptional({ example: 5, description: 'ขั้นต่ำ Threshold สำหรับแจ้งเตือน (kg)' })
  @IsOptional()
  @IsNumber()
  minThresholdKg?: number;

  @ApiProperty({ example: 250, description: 'ราคาต่อกิโลกรัม (บาท)' })
  @IsNumber()
  @IsPositive()
  pricePerKg: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  receivedAt?: string;
}

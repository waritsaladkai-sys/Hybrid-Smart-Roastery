import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoastLevel } from '@prisma/client';

export class CreateRoastJobDto {
  @ApiProperty({ description: 'ID ของ InventoryGreen batch ที่จะนำมาคั่ว' })
  @IsString()
  greenBeanId: string;

  @ApiProperty({ example: 10, description: 'น้ำหนักสารที่จะคั่ว (กิโลกรัม)' })
  @IsNumber()
  @IsPositive()
  inputWeightKg: number;

  @ApiPropertyOptional({ example: 85, description: 'Yield % คาดหวัง (default 85%)' })
  @IsOptional()
  @IsNumber()
  @Min(70)
  @Max(100)
  yieldPercent?: number;

  @ApiProperty({ enum: RoastLevel })
  @IsEnum(RoastLevel)
  targetRoastLevel: RoastLevel;

  @ApiProperty({ description: 'วันที่วางแผนคั่ว' })
  @IsDateString()
  scheduledAt: string;
}

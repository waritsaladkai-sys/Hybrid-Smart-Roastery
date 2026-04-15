import { IsString, IsNumber, IsOptional, IsEnum, IsPositive } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RoastLevel } from '@prisma/client';

export class CompleteRoastJobDto {
  @ApiProperty({ example: 8.5, description: 'น้ำหนักกาแฟคั่วจริง (กิโลกรัม)' })
  @IsNumber()
  @IsPositive()
  actualOutputKg: number;

  @ApiProperty({ enum: RoastLevel, description: 'Roast Level จริงที่ได้' })
  @IsEnum(RoastLevel)
  roastLevel: RoastLevel;

  @ApiProperty({ description: 'Product ID ที่จะโยงสต๊อกคั่วนี้' })
  @IsString()
  productId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

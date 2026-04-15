import {
  Controller, Get, Post, Patch, Param, Body, Request, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { CreateGreenBeanDto } from './dto/create-green-bean.dto';
import { CreateRoastJobDto } from './dto/create-roast-job.dto';
import { CompleteRoastJobDto } from './dto/complete-roast-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('v1/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ── Green Bean ────────────────────────────────────────────────────────────
  @Post('green')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'รับสารกาแฟเข้าสต๊อก' })
  receiveGreenBeans(@Body() dto: CreateGreenBeanDto) {
    return this.inventoryService.receiveGreenBeans(dto);
  }

  @Get('green')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.ROASTER)
  @ApiOperation({ summary: 'ดูสต๊อกสารกาแฟทั้งหมด (FIFO order)' })
  getGreenBeans() {
    return this.inventoryService.getGreenBeans();
  }

  @Get('roasted')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.ROASTER)
  @ApiOperation({ summary: 'ดูสต๊อกกาแฟคั่ว' })
  getRoastedBeans(@Query('productId') productId?: string) {
    return this.inventoryService.getRoastedBeans(productId);
  }

  // ── Roast Jobs ────────────────────────────────────────────────────────────
  @Get('roast-plan')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.ROASTER)
  @ApiOperation({ summary: 'แผนการคั่วประจำวัน (รวม pending orders)' })
  getDailyRoastPlan() {
    return this.inventoryService.getDailyRoastPlan();
  }

  @Post('roast-jobs')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.ROASTER)
  @ApiOperation({ summary: 'สร้างใบสั่งคั่ว (Roast Job Order)' })
  createRoastJob(@Body() dto: CreateRoastJobDto, @Request() req) {
    return this.inventoryService.createRoastJob(dto, req.user.sub);
  }

  @Patch('roast-jobs/:id/complete')
  @Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.ROASTER)
  @ApiOperation({ summary: 'บันทึกผลการคั่ว (น้ำหนักจริง, Yield%, Degas date)' })
  completeRoastJob(@Param('id') id: string, @Body() dto: CompleteRoastJobDto) {
    return this.inventoryService.completeRoastJob(id, dto);
  }
}

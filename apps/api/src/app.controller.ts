import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return 'Eight Coffee Roasters API — v1';
  }

  /** GET /api/v1/health — used by CI/CD pipeline and Docker healthcheck */
  @Get('api/v1/health')
  @ApiOperation({ summary: 'Health check endpoint' })
  health() {
    return {
      status: 'ok',
      service: 'eight-coffee-api',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
      env: process.env.NODE_ENV ?? 'development',
    };
  }
}

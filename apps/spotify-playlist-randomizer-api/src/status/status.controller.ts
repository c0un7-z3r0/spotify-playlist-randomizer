import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import {
  HealthCheckService,
  HealthCheck,
  HealthIndicatorResult,
  HealthCheckError,
  HealthIndicator,
} from '@nestjs/terminus';
import { JsondbService } from '@app/jsondb';
import { JsonDbHealthIndicator } from '@app/jsondb/jsondb.health';
import { SessionHealthIndicator } from '../session/session.health';

@Controller('status')
export class StatusController {
  constructor(
    private health: HealthCheckService,
    private readonly configService: ConfigService,
    private readonly jsonDbHealth:JsonDbHealthIndicator, 
    private readonly sessionHealth: SessionHealthIndicator
  ) {}

  private isDbReachable() {
    return fs.statSync(
      `${this.configService.get<string>('DB_PATH') ?? 'data'}/db`,
    );
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.jsonDbHealth.isHealthy(),
      () => this.sessionHealth.isHealthy()
    ]);
  }
}

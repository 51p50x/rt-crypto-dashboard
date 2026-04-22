import { Controller, Get } from '@nestjs/common';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { FinnhubService } from '../finnhub/finnhub.service';
import { UpstreamStatusEvent } from '../finnhub/finnhub.types';

@Controller('health')
export class HealthController {
  private readonly context = HealthController.name;

  constructor(
    private readonly logger: AppLoggerService,
    private readonly finnhubService: FinnhubService
  ) {}

  @Get()
  check(): {
    status: 'ok';
    service: string;
    timestamp: string;
    upstream: UpstreamStatusEvent;
  } {
    this.logger.info(this.context, 'Health endpoint checked.');

    return {
      status: 'ok',
      service: 'crypto-dashboard-backend',
      timestamp: new Date().toISOString(),
      upstream: this.finnhubService.getCurrentUpstreamStatus()
    };
  }
}

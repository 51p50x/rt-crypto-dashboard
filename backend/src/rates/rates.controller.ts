import { Controller, Get } from '@nestjs/common';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { RateSnapshot } from './rates.types';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  private readonly context = RatesController.name;

  constructor(
    private readonly ratesService: RatesService,
    private readonly logger: AppLoggerService
  ) {}

  @Get('latest')
  getLatest(): RateSnapshot[] {
    this.logger.info(this.context, 'Fetching latest rates snapshot.');
    return this.ratesService.getLatest();
  }
}

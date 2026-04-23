import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RatesRuntimeConfigService {
  constructor(private readonly configService: ConfigService) {}

  getEmitIntervalMs(): number {
    return this.resolveNumber(this.configService.get<string>('RATES_EMIT_INTERVAL_MS'), 250, 50);
  }

  getPersistIntervalMs(): number {
    return this.resolveNumber(
      this.configService.get<string>('RATES_PERSIST_INTERVAL_MS'),
      1000,
      100
    );
  }

  isTickDebugEnabled(): boolean {
    return this.configService.get<string>('RATES_LOG_TICK_DEBUG') === 'true';
  }

  private resolveNumber(rawValue: string | undefined, fallback: number, minValue: number): number {
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < minValue) {
      return fallback;
    }

    return parsed;
  }
}

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Observable, Subject, Subscription } from 'rxjs';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { FinnhubService } from '../finnhub/finnhub.service';
import { FinnhubTradeTick, SUPPORTED_PAIRS, SupportedPair } from '../finnhub/finnhub.types';
import { applyTickToAccumulator, toSnapshot } from './rates.helpers';
import { HourlyAverageRepository } from './repositories/hourly-average.repository';
import { HourAccumulator, RateSnapshot } from './rates.types';

@Injectable()
export class RatesService implements OnModuleInit, OnModuleDestroy {
  private readonly context = RatesService.name;
  private readonly rateUpdateSubject = new Subject<RateSnapshot>();
  private readonly latestByPair = new Map<SupportedPair, RateSnapshot>();
  private readonly accumulatorByPair = new Map<SupportedPair, HourAccumulator>();
  private readonly latestPersistedAverageByPair = new Map<SupportedPair, number>();
  private tickSubscription: Subscription | null = null;

  constructor(
    private readonly finnhubService: FinnhubService,
    private readonly hourlyAverageRepository: HourlyAverageRepository,
    private readonly logger: AppLoggerService
  ) {}

  get rateUpdates$(): Observable<RateSnapshot> {
    return this.rateUpdateSubject.asObservable();
  }

  async onModuleInit(): Promise<void> {
    await this.loadPersistedAverages();

    this.tickSubscription = this.finnhubService.ticks$.subscribe((tick) => {
      void this.handleTick(tick);
    });

    this.logger.debug(this.context, 'Rates stream subscription initialized.');
  }

  onModuleDestroy(): void {
    this.tickSubscription?.unsubscribe();
    this.tickSubscription = null;
  }

  getLatest(): RateSnapshot[] {
    return SUPPORTED_PAIRS.map((pair) => {
      const existing = this.latestByPair.get(pair);
      if (existing) {
        return existing;
      }

      return {
        symbol: pair,
        price: 0,
        timestamp: Date.now(),
        hourlyAverage: this.latestPersistedAverageByPair.get(pair) ?? null
      };
    });
  }

  async upsertHourlyAverage(symbol: SupportedPair, value: number): Promise<void> {
    const accumulator = this.accumulatorByPair.get(symbol);
    if (!accumulator) {
      return;
    }

    try {
      await this.hourlyAverageRepository.upsertAverage({
        symbol,
        hourBucket: accumulator.hourBucket,
        average: value,
        samples: accumulator.count,
        lastTickTimestamp: this.latestByPair.get(symbol)?.timestamp ?? Date.now()
      });
      this.latestPersistedAverageByPair.set(symbol, value);
    } catch (error) {
      this.logger.error(this.context, 'Failed to upsert hourly average.', error, {
        symbol,
        value
      });
    }
  }

  private async loadPersistedAverages(): Promise<void> {
    try {
      const persisted = await this.hourlyAverageRepository.getLatestAveragesBySymbol();
      for (const pair of SUPPORTED_PAIRS) {
        const average = persisted[pair];
        if (average !== undefined) {
          this.latestPersistedAverageByPair.set(pair, average);
        }
      }

      this.logger.debug(this.context, 'Loaded persisted hourly averages.');
    } catch (error) {
      this.logger.error(this.context, 'Failed to load persisted averages.', error);
    }
  }

  private async handleTick(tick: FinnhubTradeTick): Promise<void> {
    const updatedAccumulator = applyTickToAccumulator(
      this.accumulatorByPair.get(tick.symbol),
      tick
    );
    this.accumulatorByPair.set(tick.symbol, updatedAccumulator);

    const hourlyAverage = updatedAccumulator.sum / updatedAccumulator.count;
    const snapshot: RateSnapshot = toSnapshot(tick, hourlyAverage);

    this.latestByPair.set(tick.symbol, snapshot);
    this.rateUpdateSubject.next(snapshot);

    this.logger.debug(this.context, 'Processed incoming tick.', {
      symbol: tick.symbol,
      price: tick.price,
      timestamp: tick.timestamp,
      hourlyAverage
    });

    await this.upsertHourlyAverage(tick.symbol, hourlyAverage);
  }
}

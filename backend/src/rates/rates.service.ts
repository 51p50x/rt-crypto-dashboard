import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Observable, Subject, Subscription } from 'rxjs';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { FinnhubService } from '../finnhub/finnhub.service';
import { FinnhubTradeTick, SUPPORTED_PAIRS } from '../finnhub/finnhub.types';
import { HourlyAveragePersistenceScheduler } from './hourly-average-persistence-scheduler';
import { RateUpdateEmitter } from './rate-update-emitter';
import { applyTickToAccumulator, toSnapshot } from './rates.helpers';
import { RatesRuntimeConfigService } from './rates-runtime-config.service';
import { HourlyAverageRepository } from './repositories/hourly-average.repository';
import { HourAccumulator, HourlyAveragePersistencePayload, RateSnapshot } from './rates.types';

@Injectable()
export class RatesService implements OnModuleInit, OnModuleDestroy {
  private readonly context = RatesService.name;
  private readonly rateUpdateSubject = new Subject<RateSnapshot>();
  private readonly latestByPair = new Map<HourlyAveragePersistencePayload['symbol'], RateSnapshot>();
  private readonly accumulatorByPair = new Map<HourlyAveragePersistencePayload['symbol'], HourAccumulator>();
  private readonly latestPersistedAverageByPair = new Map<HourlyAveragePersistencePayload['symbol'], number>();
  private readonly rateUpdateEmitter: RateUpdateEmitter;
  private readonly persistenceScheduler: HourlyAveragePersistenceScheduler;
  private readonly logTickDebug: boolean;
  private tickSubscription: Subscription | null = null;

  constructor(
    private readonly finnhubService: FinnhubService,
    private readonly hourlyAverageRepository: HourlyAverageRepository,
    private readonly ratesRuntimeConfig: RatesRuntimeConfigService,
    private readonly logger: AppLoggerService
  ) {
    this.logTickDebug = this.ratesRuntimeConfig.isTickDebugEnabled();
    this.rateUpdateEmitter = new RateUpdateEmitter(
      this.ratesRuntimeConfig.getEmitIntervalMs(),
      (snapshot) => this.rateUpdateSubject.next(snapshot)
    );
    this.persistenceScheduler = new HourlyAveragePersistenceScheduler(
      this.ratesRuntimeConfig.getPersistIntervalMs(),
      async (payload) => this.persistAveragePayload(payload),
      (payload, error) => this.handlePersistenceError(payload, error)
    );
  }

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
    this.rateUpdateEmitter.dispose();
    this.persistenceScheduler.dispose();
    this.rateUpdateSubject.complete();
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
        timestamp: 0,
        hourlyAverage: this.latestPersistedAverageByPair.get(pair) ?? null
      };
    });
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

  private handleTick(tick: FinnhubTradeTick): void {
    const updatedAccumulator = applyTickToAccumulator(
      this.accumulatorByPair.get(tick.symbol),
      tick
    );
    this.accumulatorByPair.set(tick.symbol, updatedAccumulator);

    const hourlyAverage = updatedAccumulator.sum / updatedAccumulator.count;
    const snapshot: RateSnapshot = toSnapshot(tick, hourlyAverage);

    this.latestByPair.set(tick.symbol, snapshot);
    this.rateUpdateEmitter.schedule(snapshot);

    if (this.logTickDebug) {
      this.logger.debug(this.context, 'Processed incoming tick.', {
        symbol: tick.symbol,
        price: tick.price,
        timestamp: tick.timestamp,
        hourlyAverage
      });
    }

    this.persistenceScheduler.schedule({
      symbol: tick.symbol,
      hourBucket: updatedAccumulator.hourBucket,
      average: hourlyAverage,
      samples: updatedAccumulator.count,
      lastTickTimestamp: tick.timestamp
    });
  }

  private async persistAveragePayload(payload: HourlyAveragePersistencePayload): Promise<void> {
    await this.hourlyAverageRepository.upsertAverage(payload);
    this.latestPersistedAverageByPair.set(payload.symbol, payload.average);
  }

  private handlePersistenceError(payload: HourlyAveragePersistencePayload, error: unknown): void {
    this.logger.error(this.context, 'Failed to upsert hourly average.', error, payload);
  }
}

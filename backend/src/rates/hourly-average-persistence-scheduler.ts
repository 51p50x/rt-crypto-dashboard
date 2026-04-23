import { SupportedPair } from '../finnhub/finnhub.types';
import { HourlyAveragePersistencePayload } from './rates.types';

export class HourlyAveragePersistenceScheduler {
  private readonly pendingByPair = new Map<SupportedPair, HourlyAveragePersistencePayload>();
  private readonly timerByPair = new Map<SupportedPair, NodeJS.Timeout>();
  private readonly queueByPair = new Map<SupportedPair, Promise<void>>();

  constructor(
    private readonly intervalMs: number,
    private readonly persist: (payload: HourlyAveragePersistencePayload) => Promise<void>,
    private readonly onError: (payload: HourlyAveragePersistencePayload, error: unknown) => void
  ) {}

  schedule(payload: HourlyAveragePersistencePayload): void {
    this.pendingByPair.set(payload.symbol, payload);

    if (this.timerByPair.has(payload.symbol)) {
      return;
    }

    const timer = setTimeout(() => {
      this.timerByPair.delete(payload.symbol);
      this.persistLatest(payload.symbol);
    }, this.intervalMs);

    this.timerByPair.set(payload.symbol, timer);
  }

  dispose(): void {
    for (const timer of this.timerByPair.values()) {
      clearTimeout(timer);
    }

    this.timerByPair.clear();
    this.pendingByPair.clear();
  }

  private persistLatest(symbol: SupportedPair): void {
    const payload = this.pendingByPair.get(symbol);
    if (!payload) {
      return;
    }

    this.pendingByPair.delete(symbol);
    const previousTask = this.queueByPair.get(symbol) ?? Promise.resolve();

    const currentTask = previousTask
      .then(async () => {
        await this.persist(payload);
      })
      .catch((error) => {
        this.onError(payload, error);
      })
      .finally(() => {
        const queuedTask = this.queueByPair.get(symbol);
        if (queuedTask === currentTask) {
          this.queueByPair.delete(symbol);
        }

        if (this.pendingByPair.has(symbol) && !this.timerByPair.has(symbol)) {
          const timer = setTimeout(() => {
            this.timerByPair.delete(symbol);
            this.persistLatest(symbol);
          }, this.intervalMs);
          this.timerByPair.set(symbol, timer);
        }
      });

    this.queueByPair.set(symbol, currentTask);
  }
}

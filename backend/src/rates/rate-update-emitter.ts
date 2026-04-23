import { SupportedPair } from '../finnhub/finnhub.types';
import { RateSnapshot } from './rates.types';

export class RateUpdateEmitter {
  private readonly pendingByPair = new Map<SupportedPair, RateSnapshot>();
  private readonly timerByPair = new Map<SupportedPair, NodeJS.Timeout>();

  constructor(
    private readonly intervalMs: number,
    private readonly emit: (snapshot: RateSnapshot) => void
  ) {}

  schedule(snapshot: RateSnapshot): void {
    this.pendingByPair.set(snapshot.symbol, snapshot);

    if (this.timerByPair.has(snapshot.symbol)) {
      return;
    }

    const timer = setTimeout(() => {
      this.timerByPair.delete(snapshot.symbol);
      this.flush(snapshot.symbol);
    }, this.intervalMs);

    this.timerByPair.set(snapshot.symbol, timer);
  }

  dispose(): void {
    for (const timer of this.timerByPair.values()) {
      clearTimeout(timer);
    }

    this.timerByPair.clear();
    this.pendingByPair.clear();
  }

  private flush(symbol: SupportedPair): void {
    const snapshot = this.pendingByPair.get(symbol);
    if (!snapshot) {
      return;
    }

    this.pendingByPair.delete(symbol);
    this.emit(snapshot);
  }
}

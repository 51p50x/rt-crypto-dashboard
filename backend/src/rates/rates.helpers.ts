import { FinnhubTradeTick } from '../finnhub/finnhub.types';
import { HourAccumulator, RateSnapshot } from './rates.types';
import { toHourBucket } from './rates.utils';

export function applyTickToAccumulator(
  current: HourAccumulator | undefined,
  tick: FinnhubTradeTick
): HourAccumulator {
  const nextBucket = toHourBucket(tick.timestamp);

  if (!current || current.hourBucket !== nextBucket) {
    return {
      hourBucket: nextBucket,
      sum: tick.price,
      count: 1
    };
  }

  return {
    hourBucket: current.hourBucket,
    sum: current.sum + tick.price,
    count: current.count + 1
  };
}

export function toSnapshot(tick: FinnhubTradeTick, hourlyAverage: number): RateSnapshot {
  return {
    symbol: tick.symbol,
    price: tick.price,
    timestamp: tick.timestamp,
    hourlyAverage
  };
}

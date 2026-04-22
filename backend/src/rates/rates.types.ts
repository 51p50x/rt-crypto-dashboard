import { SupportedPair } from '../finnhub/finnhub.types';

export interface RateSnapshot {
  symbol: SupportedPair;
  price: number;
  timestamp: number;
  hourlyAverage: number | null;
}

export interface HourAccumulator {
  hourBucket: string;
  sum: number;
  count: number;
}

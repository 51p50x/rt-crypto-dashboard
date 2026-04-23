import { RateSnapshot, SupportedPair } from './types';

export const SUPPORTED_PAIRS: SupportedPair[] = ['ETHUSDC', 'ETHUSDT', 'ETHBTC'];
export const MAX_HISTORY_POINTS = 120;
export const PAIR_LABEL_BY_SYMBOL: Record<SupportedPair, string> = {
  ETHUSDC: 'ETH -> USDC',
  ETHUSDT: 'ETH -> USDT',
  ETHBTC: 'ETH -> BTC'
};

export const INITIAL_RATE_SNAPSHOTS: RateSnapshot[] = [
  {
    symbol: 'ETHUSDC',
    price: 2355.1,
    timestamp: Date.now(),
    hourlyAverage: 2354.8
  },
  {
    symbol: 'ETHUSDT',
    price: 2354.6,
    timestamp: Date.now(),
    hourlyAverage: 2354.2
  },
  {
    symbol: 'ETHBTC',
    price: 0.03,
    timestamp: Date.now(),
    hourlyAverage: 0.03
  }
];

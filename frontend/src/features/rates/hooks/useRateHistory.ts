import { useRatesStore } from '../store/rates.store';
import { RateSnapshot, SupportedPair } from '../types';

export function useRateHistory(symbol: SupportedPair): RateSnapshot[] {
  return useRatesStore((state) => state.historyByPair[symbol]);
}

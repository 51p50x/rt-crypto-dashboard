export type SupportedPair = 'ETHUSDC' | 'ETHUSDT' | 'ETHBTC';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export interface RateSnapshot {
  symbol: SupportedPair;
  price: number;
  timestamp: number;
  hourlyAverage: number | null;
}

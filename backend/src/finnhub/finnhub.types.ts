export type SupportedPair = 'ETHUSDC' | 'ETHUSDT' | 'ETHBTC';

export const SUPPORTED_PAIRS: SupportedPair[] = ['ETHUSDC', 'ETHUSDT', 'ETHBTC'];

export const FINNHUB_SYMBOL_BY_PAIR: Record<SupportedPair, string> = {
  ETHUSDC: 'BINANCE:ETHUSDC',
  ETHUSDT: 'BINANCE:ETHUSDT',
  ETHBTC: 'BINANCE:ETHBTC'
};

export interface FinnhubTradeTick {
  symbol: SupportedPair;
  price: number;
  timestamp: number;
}

export interface FinnhubWsTradePayload {
  p: number;
  s: string;
  t: number;
  v: number;
}

export interface FinnhubWsTradeMessage {
  data: FinnhubWsTradePayload[];
  type: 'trade';
}

export type UpstreamConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'mock';

export interface UpstreamStatusEvent {
  status: UpstreamConnectionStatus;
  timestamp: number;
  reason?: string;
}

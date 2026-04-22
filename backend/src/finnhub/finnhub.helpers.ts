import {
  FINNHUB_SYMBOL_BY_PAIR,
  FinnhubTradeTick,
  FinnhubWsTradeMessage,
  SUPPORTED_PAIRS,
  SupportedPair
} from './finnhub.types';

export function buildPairByFinnhubSymbolMap(): Map<string, SupportedPair> {
  const map = new Map<string, SupportedPair>();

  for (const [pair, finnhubSymbol] of Object.entries(FINNHUB_SYMBOL_BY_PAIR)) {
    map.set(finnhubSymbol, pair as SupportedPair);
  }

  return map;
}

export function parseTradeTicks(
  rawMessage: string,
  pairByFinnhubSymbol: Map<string, SupportedPair>
): FinnhubTradeTick[] {
  const parsed = JSON.parse(rawMessage) as Partial<FinnhubWsTradeMessage>;
  if (parsed.type !== 'trade' || !Array.isArray(parsed.data)) {
    return [];
  }

  const ticks: FinnhubTradeTick[] = [];

  for (const trade of parsed.data) {
    if (
      !trade ||
      typeof trade.s !== 'string' ||
      typeof trade.p !== 'number' ||
      typeof trade.t !== 'number'
    ) {
      continue;
    }

    const pair = pairByFinnhubSymbol.get(trade.s);
    if (!pair) {
      continue;
    }

    ticks.push({
      symbol: pair,
      price: trade.p,
      timestamp: trade.t
    });
  }

  return ticks;
}

export function buildInitialMockPriceByPair(): Record<SupportedPair, number> {
  return {
    ETHUSDC: 3000,
    ETHUSDT: 3000,
    ETHBTC: 0.05
  };
}

export function generateMockTick(
  pair: SupportedPair,
  currentPrice: number,
  timestamp: number
): FinnhubTradeTick {
  const nextPrice = getNextMockPrice(currentPrice, pair === 'ETHBTC' ? 0.0002 : 0.002);

  return {
    symbol: pair,
    price: Number(nextPrice.toFixed(pair === 'ETHBTC' ? 6 : 2)),
    timestamp
  };
}

function getNextMockPrice(currentPrice: number, maxRelativeDelta: number): number {
  const randomFactor = (Math.random() * 2 - 1) * maxRelativeDelta;
  return Math.max(currentPrice * (1 + randomFactor), Number.EPSILON);
}

export function resolveMockIntervalMs(rawValue: string | undefined): number {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1000;
  }

  return parsed;
}

export function getSupportedPairs(): readonly SupportedPair[] {
  return SUPPORTED_PAIRS;
}

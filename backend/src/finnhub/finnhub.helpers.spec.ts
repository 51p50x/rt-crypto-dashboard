import {
  buildPairByFinnhubSymbolMap,
  isEnvFlagEnabled,
  parseTradeTicks,
  resolveMaxReconnectAttempts
} from './finnhub.helpers';

describe('finnhub helpers', () => {
  it('builds map from finnhub symbol to pair', () => {
    const map = buildPairByFinnhubSymbolMap();

    expect(map.get('BINANCE:ETHUSDC')).toBe('ETHUSDC');
    expect(map.get('BINANCE:ETHUSDT')).toBe('ETHUSDT');
    expect(map.get('BINANCE:ETHBTC')).toBe('ETHBTC');
  });

  it('parses only supported trades', () => {
    const map = buildPairByFinnhubSymbolMap();
    const raw = JSON.stringify({
      type: 'trade',
      data: [
        { s: 'BINANCE:ETHUSDT', p: 3450.11, t: 1710000000000, v: 0.2 },
        { s: 'COINBASE:ETHUSD', p: 3500.12, t: 1710000000001, v: 0.1 }
      ]
    });

    const ticks = parseTradeTicks(raw, map);

    expect(ticks).toEqual([
      {
        symbol: 'ETHUSDT',
        price: 3450.11,
        timestamp: 1710000000000
      }
    ]);
  });

  it('parses flexible env boolean flags', () => {
    expect(isEnvFlagEnabled('true')).toBe(true);
    expect(isEnvFlagEnabled('TRUE')).toBe(true);
    expect(isEnvFlagEnabled('1')).toBe(true);
    expect(isEnvFlagEnabled('yes')).toBe(true);
    expect(isEnvFlagEnabled('on')).toBe(true);
    expect(isEnvFlagEnabled('false')).toBe(false);
    expect(isEnvFlagEnabled(undefined)).toBe(false);
  });

  it('resolves max reconnect attempts with safe fallback', () => {
    expect(resolveMaxReconnectAttempts('-1')).toBeNull();
    expect(resolveMaxReconnectAttempts(undefined)).toBeNull();
    expect(resolveMaxReconnectAttempts('foo')).toBeNull();
    expect(resolveMaxReconnectAttempts('0')).toBe(0);
    expect(resolveMaxReconnectAttempts('5.9')).toBe(5);
  });
});

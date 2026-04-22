import { FinnhubTradeTick } from '../finnhub/finnhub.types';
import { applyTickToAccumulator, toSnapshot } from './rates.helpers';

describe('rates helpers', () => {
  const firstTick: FinnhubTradeTick = {
    symbol: 'ETHUSDC',
    price: 3000,
    timestamp: Date.parse('2026-04-21T10:15:00.000Z')
  };

  it('creates new accumulator when missing', () => {
    const accumulator = applyTickToAccumulator(undefined, firstTick);

    expect(accumulator).toEqual({
      hourBucket: '2026-04-21T10:00:00.000Z',
      sum: 3000,
      count: 1
    });
  });

  it('accumulates ticks in same hour', () => {
    const current = {
      hourBucket: '2026-04-21T10:00:00.000Z',
      sum: 6000,
      count: 2
    };

    const nextTick: FinnhubTradeTick = {
      symbol: 'ETHUSDC',
      price: 3300,
      timestamp: Date.parse('2026-04-21T10:55:00.000Z')
    };

    const accumulator = applyTickToAccumulator(current, nextTick);

    expect(accumulator).toEqual({
      hourBucket: '2026-04-21T10:00:00.000Z',
      sum: 9300,
      count: 3
    });
  });

  it('resets accumulator when hour changes', () => {
    const current = {
      hourBucket: '2026-04-21T10:00:00.000Z',
      sum: 6000,
      count: 2
    };

    const nextTick: FinnhubTradeTick = {
      symbol: 'ETHUSDC',
      price: 3400,
      timestamp: Date.parse('2026-04-21T11:00:01.000Z')
    };

    const accumulator = applyTickToAccumulator(current, nextTick);

    expect(accumulator).toEqual({
      hourBucket: '2026-04-21T11:00:00.000Z',
      sum: 3400,
      count: 1
    });
  });

  it('builds rate snapshot from tick and average', () => {
    expect(toSnapshot(firstTick, 3100)).toEqual({
      symbol: 'ETHUSDC',
      price: 3000,
      timestamp: Date.parse('2026-04-21T10:15:00.000Z'),
      hourlyAverage: 3100
    });
  });
});

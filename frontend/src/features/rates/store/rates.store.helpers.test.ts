import { describe, expect, it } from 'vitest';
import { RateSnapshot } from '../types';
import {
  appendHistory,
  applyBootstrapToState,
  applyRateUpdateToState,
  mapUpstreamStatus
} from './rates.store.helpers';
import { RatesDataState } from './rates.store.types';

function createBaseState(): RatesDataState {
  return {
    ratesByPair: {
      ETHUSDC: {
        symbol: 'ETHUSDC',
        price: 2300,
        timestamp: 1000,
        hourlyAverage: 2290
      },
      ETHUSDT: {
        symbol: 'ETHUSDT',
        price: 2310,
        timestamp: 1000,
        hourlyAverage: 2300
      },
      ETHBTC: {
        symbol: 'ETHBTC',
        price: 0.03,
        timestamp: 1000,
        hourlyAverage: 0.029
      }
    },
    historyByPair: {
      ETHUSDC: [
        { symbol: 'ETHUSDC', price: 2300, timestamp: 1000, hourlyAverage: 2290 }
      ],
      ETHUSDT: [
        { symbol: 'ETHUSDT', price: 2310, timestamp: 1000, hourlyAverage: 2300 }
      ],
      ETHBTC: [{ symbol: 'ETHBTC', price: 0.03, timestamp: 1000, hourlyAverage: 0.029 }]
    }
  };
}

describe('rates store helpers', () => {
  it('maps upstream status into connection status', () => {
    expect(mapUpstreamStatus('connected')).toBe('connected');
    expect(mapUpstreamStatus('mock')).toBe('connected');
    expect(mapUpstreamStatus('connecting')).toBe('connecting');
    expect(mapUpstreamStatus('disconnected')).toBe('disconnected');
  });

  it('applies bootstrap snapshots into rates and history', () => {
    const state = createBaseState();
    const bootstrap: RateSnapshot[] = [
      {
        symbol: 'ETHUSDT',
        price: 2400,
        timestamp: 2000,
        hourlyAverage: 2390
      }
    ];

    const nextState = applyBootstrapToState(state, bootstrap);

    expect(nextState.ratesByPair.ETHUSDT.price).toBe(2400);
    expect(nextState.historyByPair.ETHUSDT.at(-1)?.timestamp).toBe(2000);
  });

  it('applies single rate update into state', () => {
    const state = createBaseState();
    const update: RateSnapshot = {
      symbol: 'ETHBTC',
      price: 0.031,
      timestamp: 3000,
      hourlyAverage: 0.0305
    };

    const nextState = applyRateUpdateToState(state, update);

    expect(nextState.ratesByPair.ETHBTC.price).toBe(0.031);
    expect(nextState.historyByPair.ETHBTC.at(-1)?.timestamp).toBe(3000);
  });

  it('trims history to max points window', () => {
    const seed: RateSnapshot = {
      symbol: 'ETHUSDT',
      price: 2000,
      timestamp: 1,
      hourlyAverage: 2000
    };

    let history: RateSnapshot[] = [seed];
    for (let i = 2; i <= 140; i += 1) {
      history = appendHistory(history, { ...seed, timestamp: i });
    }

    expect(history.length).toBe(120);
    expect(history[0].timestamp).toBe(21);
    expect(history.at(-1)?.timestamp).toBe(140);
  });
});

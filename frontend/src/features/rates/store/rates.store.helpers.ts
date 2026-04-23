import { UpstreamStatusEvent } from '../../../lib/ws/types';
import { MAX_HISTORY_POINTS, INITIAL_RATE_SNAPSHOTS, SUPPORTED_PAIRS } from '../constants';
import { ConnectionStatus, RateSnapshot, SupportedPair } from '../types';
import { RatesDataState } from './rates.store.types';

export function buildInitialRates(): Record<SupportedPair, RateSnapshot> {
  return INITIAL_RATE_SNAPSHOTS.reduce(
    (accumulator, snapshot) => {
      accumulator[snapshot.symbol] = snapshot;
      return accumulator;
    },
    {} as Record<SupportedPair, RateSnapshot>
  );
}

export function buildInitialHistory(): Record<SupportedPair, RateSnapshot[]> {
  const rates = buildInitialRates();
  return SUPPORTED_PAIRS.reduce(
    (accumulator, pair) => {
      accumulator[pair] = [rates[pair]];
      return accumulator;
    },
    {} as Record<SupportedPair, RateSnapshot[]>
  );
}

export function appendHistory(history: RateSnapshot[], snapshot: RateSnapshot): RateSnapshot[] {
  const nextHistory = [...history, snapshot];
  if (nextHistory.length <= MAX_HISTORY_POINTS) {
    return nextHistory;
  }

  return nextHistory.slice(nextHistory.length - MAX_HISTORY_POINTS);
}

export function mapUpstreamStatus(status: UpstreamStatusEvent['status']): ConnectionStatus {
  if (status === 'connected' || status === 'mock') {
    return 'connected';
  }

  if (status === 'connecting') {
    return 'connecting';
  }

  return 'disconnected';
}

export function applyBootstrapToState(
  state: RatesDataState,
  snapshots: RateSnapshot[]
): RatesDataState {
  const nextRatesByPair = { ...state.ratesByPair };
  const nextHistoryByPair = { ...state.historyByPair };

  for (const snapshot of snapshots) {
    nextRatesByPair[snapshot.symbol] = snapshot;
    nextHistoryByPair[snapshot.symbol] = appendHistory(nextHistoryByPair[snapshot.symbol], snapshot);
  }

  return {
    ratesByPair: nextRatesByPair,
    historyByPair: nextHistoryByPair
  };
}

export function applyRateUpdateToState(
  state: RatesDataState,
  snapshot: RateSnapshot
): RatesDataState {
  return {
    ratesByPair: {
      ...state.ratesByPair,
      [snapshot.symbol]: snapshot
    },
    historyByPair: {
      ...state.historyByPair,
      [snapshot.symbol]: appendHistory(state.historyByPair[snapshot.symbol], snapshot)
    }
  };
}

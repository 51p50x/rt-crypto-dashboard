import { create } from 'zustand';
import { RatesState } from './rates.store.types';
import {
  applyBootstrapToState,
  applyRateUpdateToState,
  buildInitialHistory,
  buildInitialRates,
  mapUpstreamStatus
} from './rates.store.helpers';

export const useRatesStore = create<RatesState>((set) => ({
  connectionStatus: 'idle',
  connectionMessage: 'Waiting for stream integration.',
  ratesByPair: buildInitialRates(),
  historyByPair: buildInitialHistory(),
  initializeMockData: () =>
    set(() => ({
      ratesByPair: buildInitialRates(),
      historyByPair: buildInitialHistory()
    })),
  applyBootstrap: (snapshots) =>
    set((state) => applyBootstrapToState(state, snapshots)),
  applyRateUpdate: (snapshot) =>
    set((state) => applyRateUpdateToState(state, snapshot)),
  applyUpstreamStatus: (event) =>
    set(() => ({
      connectionStatus: mapUpstreamStatus(event.status),
      connectionMessage: event.reason ? `Upstream: ${event.status} (${event.reason})` : `Upstream: ${event.status}`
    })),
  setConnectionStatus: (status, message) =>
    set(() => ({
      connectionStatus: status,
      connectionMessage: message ?? null
    }))
}));

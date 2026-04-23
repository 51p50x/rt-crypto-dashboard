import { UpstreamStatusEvent } from '../../../lib/ws/types';
import { ConnectionStatus, RateSnapshot, SupportedPair } from '../types';

export interface RatesDataState {
  ratesByPair: Record<SupportedPair, RateSnapshot>;
  historyByPair: Record<SupportedPair, RateSnapshot[]>;
}

export interface RatesState {
  connectionStatus: ConnectionStatus;
  connectionMessage: string | null;
  ratesByPair: RatesDataState['ratesByPair'];
  historyByPair: RatesDataState['historyByPair'];
  initializeMockData: () => void;
  applyBootstrap: (snapshots: RateSnapshot[]) => void;
  applyRateUpdate: (snapshot: RateSnapshot) => void;
  applyUpstreamStatus: (event: UpstreamStatusEvent) => void;
  setConnectionStatus: (status: ConnectionStatus, message?: string) => void;
}

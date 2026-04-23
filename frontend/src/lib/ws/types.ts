import { RateSnapshot } from '../../features/rates/types';

export type UpstreamStatus = 'connecting' | 'connected' | 'disconnected' | 'mock';

export interface UpstreamStatusEvent {
  status: UpstreamStatus;
  timestamp: number;
  reason?: string;
}

export interface RatesWsEvents {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onConnectError?: (error: Error) => void;
  onBootstrap?: (snapshots: RateSnapshot[]) => void;
  onRateUpdate?: (snapshot: RateSnapshot) => void;
  onUpstreamStatus?: (event: UpstreamStatusEvent) => void;
}

import { useEffect } from 'react';
import { RatesWsClient } from '../../../lib/ws/client';
import { useRatesStore } from '../store/rates.store';

export function useRatesStream(): void {
  const applyBootstrap = useRatesStore((state) => state.applyBootstrap);
  const applyRateUpdate = useRatesStore((state) => state.applyRateUpdate);
  const applyUpstreamStatus = useRatesStore((state) => state.applyUpstreamStatus);
  const setConnectionStatus = useRatesStore((state) => state.setConnectionStatus);

  useEffect(() => {
    const backendWsUrl = import.meta.env.VITE_BACKEND_WS_URL ?? 'http://localhost:3000';
    const client = new RatesWsClient(backendWsUrl);

    setConnectionStatus('connecting', `Connecting to ${backendWsUrl}`);

    client.connect({
      onConnect: () => {
        setConnectionStatus('connected', 'Connected to backend WebSocket.');
      },
      onDisconnect: (reason) => {
        setConnectionStatus('disconnected', `Disconnected: ${reason}`);
      },
      onConnectError: (error) => {
        setConnectionStatus('error', `Connection error: ${error.message}`);
      },
      onBootstrap: (snapshots) => {
        applyBootstrap(snapshots);
      },
      onRateUpdate: (snapshot) => {
        applyRateUpdate(snapshot);
      },
      onUpstreamStatus: (event) => {
        applyUpstreamStatus(event);
      }
    });

    return () => {
      client.disconnect();
    };
  }, [applyBootstrap, applyRateUpdate, applyUpstreamStatus, setConnectionStatus]);
}

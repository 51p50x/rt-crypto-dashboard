import { ConnectionBadge } from '../components/ConnectionBadge';
import { useRatesStream } from '../features/rates/hooks/useRatesStream';
import { RateGrid } from '../features/rates/components/RateGrid';
import { useRatesStore } from '../features/rates/store/rates.store';

export function Dashboard(): JSX.Element {
  useRatesStream();

  const connectionStatus = useRatesStore((state) => state.connectionStatus);
  const connectionMessage = useRatesStore((state) => state.connectionMessage);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <h1 className="page-title">RT Crypto Dashboard</h1>
          <p className="muted">Live dashboard for ETH -&gt; USDC, ETH -&gt; USDT and ETH -&gt; BTC.</p>
        </div>
        <ConnectionBadge status={connectionStatus} />
      </header>

      {connectionMessage ? <p className="muted connection-note">{connectionMessage}</p> : null}

      <RateGrid />
    </main>
  );
}

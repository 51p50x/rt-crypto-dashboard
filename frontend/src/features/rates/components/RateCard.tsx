import { Card } from '../../../components/ui/Card';
import { formatPrice, formatTimestamp } from '../../../lib/format';
import { PAIR_LABEL_BY_SYMBOL } from '../constants';
import { RateChart } from './RateChart';
import { RateSnapshot } from '../types';

interface RateCardProps {
  snapshot: RateSnapshot;
}

export function RateCard({ snapshot }: RateCardProps): JSX.Element {
  const pairLabel = PAIR_LABEL_BY_SYMBOL[snapshot.symbol];

  return (
    <Card>
      <div className="rate-header">
        <strong className="pair-symbol">{pairLabel}</strong>
        <span className="rate-price">{formatPrice(snapshot.price)}</span>
      </div>

      <div className="rate-meta">
        <div>Hourly Avg: {snapshot.hourlyAverage ? formatPrice(snapshot.hourlyAverage) : '-'}</div>
        <div>Last Tick: {formatTimestamp(snapshot.timestamp)}</div>
      </div>

      <RateChart symbol={snapshot.symbol} />
    </Card>
  );
}

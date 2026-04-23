import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useRateHistory } from '../hooks/useRateHistory';
import { SupportedPair } from '../types';

interface RateChartProps {
  symbol: SupportedPair;
}

export function RateChart({ symbol }: RateChartProps): JSX.Element {
  const history = useRateHistory(symbol);
  const chartData = history
    .filter((entry) => entry.timestamp > 0 && entry.price > 0)
    .map((entry) => ({
      time: entry.timestamp,
      price: entry.price
    }));

  if (chartData.length < 2) {
    return <div className="chart-empty">Waiting for live ticks...</div>;
  }

  return (
    <div style={{ width: '100%', height: 160 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="time" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip />
          <Line type="monotone" dataKey="price" stroke="#60a5fa" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

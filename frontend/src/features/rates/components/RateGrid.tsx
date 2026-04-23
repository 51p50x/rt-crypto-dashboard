import { SUPPORTED_PAIRS } from '../constants';
import { useRatesStore } from '../store/rates.store';
import { RateCard } from './RateCard';

export function RateGrid(): JSX.Element {
  const ratesByPair = useRatesStore((state) => state.ratesByPair);

  return (
    <section className="rates-grid">
      {SUPPORTED_PAIRS.map((pair) => (
        <RateCard key={pair} snapshot={ratesByPair[pair]} />
      ))}
    </section>
  );
}

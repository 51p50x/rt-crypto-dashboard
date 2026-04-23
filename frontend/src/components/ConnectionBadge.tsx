import { ConnectionStatus } from '../features/rates/types';

interface ConnectionBadgeProps {
  status: ConnectionStatus;
}

export function ConnectionBadge({ status }: ConnectionBadgeProps): JSX.Element {
  const className = `status-badge status-${status}`;

  return <span className={className}>{status.toUpperCase()}</span>;
}

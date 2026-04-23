import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps): JSX.Element {
  return <section className="card">{children}</section>;
}

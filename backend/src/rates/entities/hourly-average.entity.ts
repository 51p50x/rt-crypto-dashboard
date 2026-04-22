import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { SupportedPair } from '../../finnhub/finnhub.types';

@Entity({ name: 'hourly_averages' })
@Index(['symbol', 'hourBucket'], { unique: true })
export class HourlyAverageEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  symbol!: SupportedPair;

  @Column({ type: 'varchar' })
  hourBucket!: string;

  @Column({ type: 'float' })
  average!: number;

  @Column({ type: 'int' })
  samples!: number;

  @Column({ type: 'bigint' })
  lastTickTimestamp!: number;
}

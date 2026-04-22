import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AppLoggerService } from '../../common/logger/app-logger.service';
import { SUPPORTED_PAIRS, SupportedPair } from '../../finnhub/finnhub.types';
import { HourlyAverageEntity } from '../entities/hourly-average.entity';

interface UpsertHourlyAverageParams {
  symbol: SupportedPair;
  hourBucket: string;
  average: number;
  samples: number;
  lastTickTimestamp: number;
}

@Injectable()
export class HourlyAverageRepository {
  private readonly context = HourlyAverageRepository.name;

  constructor(
    @InjectRepository(HourlyAverageEntity)
    private readonly repository: Repository<HourlyAverageEntity>,
    private readonly logger: AppLoggerService
  ) {}

  async upsertAverage(params: UpsertHourlyAverageParams): Promise<void> {
    await this.repository.upsert(
      {
        symbol: params.symbol,
        hourBucket: params.hourBucket,
        average: params.average,
        samples: params.samples,
        lastTickTimestamp: params.lastTickTimestamp
      },
      ['symbol', 'hourBucket']
    );

    this.logger.debug(this.context, 'Hourly average upserted.', params);
  }

  async getLatestAveragesBySymbol(): Promise<Partial<Record<SupportedPair, number>>> {
    const rows = await this.repository.find({
      where: {
        symbol: In(SUPPORTED_PAIRS)
      },
      order: {
        hourBucket: 'DESC'
      }
    });

    const result: Partial<Record<SupportedPair, number>> = {};

    for (const row of rows) {
      if (result[row.symbol] !== undefined) {
        continue;
      }

      result[row.symbol] = row.average;
    }

    return result;
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinnhubModule } from '../finnhub/finnhub.module';
import { RatesController } from './rates.controller';
import { HourlyAverageEntity } from './entities/hourly-average.entity';
import { RatesRuntimeConfigService } from './rates-runtime-config.service';
import { HourlyAverageRepository } from './repositories/hourly-average.repository';
import { RatesService } from './rates.service';

@Module({
  imports: [TypeOrmModule.forFeature([HourlyAverageEntity]), FinnhubModule],
  controllers: [RatesController],
  providers: [RatesService, HourlyAverageRepository, RatesRuntimeConfigService],
  exports: [RatesService]
})
export class RatesModule {}

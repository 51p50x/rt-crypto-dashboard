import { Module } from '@nestjs/common';
import { FinnhubModule } from '../finnhub/finnhub.module';
import { HealthController } from './health.controller';

@Module({
  imports: [FinnhubModule],
  controllers: [HealthController]
})
export class HealthModule {}

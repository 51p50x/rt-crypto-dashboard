import { Module } from '@nestjs/common';
import { FinnhubModule } from '../finnhub/finnhub.module';
import { RatesModule } from '../rates/rates.module';
import { RatesGateway } from './rates.gateway';

@Module({
  imports: [FinnhubModule, RatesModule],
  providers: [RatesGateway],
  exports: [RatesGateway]
})
export class StreamingModule {}

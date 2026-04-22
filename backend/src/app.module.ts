import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from './common/logger/logger.module';
import { FinnhubModule } from './finnhub/finnhub.module';
import { HealthModule } from './health/health.module';
import { RatesModule } from './rates/rates.module';
import { StreamingModule } from './streaming/streaming.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite' as const,
        database: configService.get<string>('DATABASE_PATH') ?? './crypto-dashboard.sqlite',
        autoLoadEntities: true,
        synchronize: true
      })
    }),
    LoggerModule,
    FinnhubModule,
    RatesModule,
    StreamingModule,
    HealthModule
  ]
})
export class AppModule {}

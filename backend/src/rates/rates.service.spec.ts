import { Subject } from 'rxjs';
import { FinnhubService } from '../finnhub/finnhub.service';
import { FinnhubTradeTick } from '../finnhub/finnhub.types';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { HourlyAverageRepository } from './repositories/hourly-average.repository';
import { RatesService } from './rates.service';

describe('RatesService', () => {
  const tickStream = new Subject<FinnhubTradeTick>();

  const finnhubServiceMock = {
    get ticks$() {
      return tickStream.asObservable();
    }
  } as FinnhubService;

  const hourlyAverageRepositoryMock = {
    getLatestAveragesBySymbol: jest.fn(),
    upsertAverage: jest.fn()
  } as unknown as HourlyAverageRepository;

  const loggerMock = {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn()
  } as unknown as AppLoggerService;

  let service: RatesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    hourlyAverageRepositoryMock.getLatestAveragesBySymbol = jest
      .fn()
      .mockResolvedValue({ ETHUSDC: 2900 });
    hourlyAverageRepositoryMock.upsertAverage = jest.fn().mockResolvedValue(undefined);

    service = new RatesService(finnhubServiceMock, hourlyAverageRepositoryMock, loggerMock);
    await service.onModuleInit();
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  it('loads persisted averages for initial snapshot', () => {
    const latest = service.getLatest();
    const ethUsdc = latest.find((item) => item.symbol === 'ETHUSDC');

    expect(ethUsdc?.hourlyAverage).toBe(2900);
  });

  it('processes incoming tick and persists hourly average', async () => {
    tickStream.next({
      symbol: 'ETHUSDC',
      price: 3000,
      timestamp: Date.parse('2026-04-21T10:20:00.000Z')
    });

    await flushPromises();

    const latest = service.getLatest().find((item) => item.symbol === 'ETHUSDC');
    expect(latest?.price).toBe(3000);
    expect(latest?.hourlyAverage).toBe(3000);
    expect(hourlyAverageRepositoryMock.upsertAverage).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: 'ETHUSDC',
        hourBucket: '2026-04-21T10:00:00.000Z',
        average: 3000,
        samples: 1
      })
    );
  });
});

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

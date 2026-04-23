import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebSocket } from 'ws';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AppLoggerService } from '../common/logger/app-logger.service';
import {
  buildInitialMockPriceByPair,
  buildPairByFinnhubSymbolMap,
  generateMockTick,
  getSupportedPairs,
  isEnvFlagEnabled,
  parseTradeTicks,
  resolveMaxReconnectAttempts,
  resolveMockIntervalMs
} from './finnhub.helpers';
import { getBackoffDelayMs } from './reconnect.strategy';
import {
  FINNHUB_SYMBOL_BY_PAIR,
  FinnhubTradeTick,
  UpstreamStatusEvent
} from './finnhub.types';

@Injectable()
export class FinnhubService implements OnModuleInit, OnModuleDestroy {
  private readonly context = FinnhubService.name;
  private readonly pairByFinnhubSymbol = buildPairByFinnhubSymbolMap();
  private readonly tickSubject = new Subject<FinnhubTradeTick>();
  private readonly upstreamStatusSubject = new BehaviorSubject<UpstreamStatusEvent>({
    status: 'disconnected',
    timestamp: Date.now()
  });

  private socket: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private mockTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isShuttingDown = false;
  private readonly mockPriceByPair = buildInitialMockPriceByPair();
  private readonly maxReconnectAttempts: number | null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLoggerService
  ) {
    this.maxReconnectAttempts = resolveMaxReconnectAttempts(
      this.configService.get<string>('FINNHUB_MAX_RECONNECT_ATTEMPTS')
    );
  }

  get ticks$(): Observable<FinnhubTradeTick> {
    return this.tickSubject.asObservable();
  }

  get upstreamStatus$(): Observable<UpstreamStatusEvent> {
    return this.upstreamStatusSubject.asObservable();
  }

  getCurrentUpstreamStatus(): UpstreamStatusEvent {
    return this.upstreamStatusSubject.getValue();
  }

  onModuleInit(): void {
    this.start();
  }

  onModuleDestroy(): void {
    this.stop();
    this.tickSubject.complete();
    this.upstreamStatusSubject.complete();
  }

  start(): void {
    this.isShuttingDown = false;

    if (isEnvFlagEnabled(this.configService.get<string>('MOCK_STREAM_ENABLED'))) {
      this.startMockStream();
      return;
    }

    const apiKey = this.configService.get<string>('FINNHUB_API_KEY');
    if (!apiKey) {
      this.logger.error(this.context, 'Missing FINNHUB_API_KEY. Skipping connection.');
      this.emitUpstreamStatus('disconnected', 'missing_api_key');
      return;
    }

    this.clearReconnectTimer();
    this.clearMockTimer();
    this.cleanupSocket();
    this.emitUpstreamStatus('connecting');

    const wsUrl = `wss://ws.finnhub.io?token=${apiKey}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.on('open', () => this.onOpen());
    this.socket.on('message', (rawMessage) => this.onMessage(rawMessage.toString()));
    this.socket.on('error', (error) => {
      // Reconnect flow is handled in the close event emitted by ws.
      this.logger.error(this.context, 'Finnhub WebSocket error.', error);
    });
    this.socket.on('close', (code, reasonBuffer) => {
      const reason = reasonBuffer?.toString() ?? '';
      this.onClose(code, reason);
    });
  }

  stop(): void {
    this.isShuttingDown = true;
    this.clearReconnectTimer();
    this.clearMockTimer();
    this.cleanupSocket();

    this.logger.debug(this.context, 'Finnhub connection stopped.');
    this.emitUpstreamStatus('disconnected', 'stopped');
  }

  private onOpen(): void {
    this.reconnectAttempts = 0;
    this.logger.debug(this.context, 'Connected to Finnhub WebSocket.');
    this.emitUpstreamStatus('connected');

    for (const pair of getSupportedPairs()) {
      const symbol = FINNHUB_SYMBOL_BY_PAIR[pair];
      this.socket?.send(JSON.stringify({ type: 'subscribe', symbol }));
      this.logger.debug(this.context, 'Subscribed to symbol.', { pair, symbol });
    }
  }

  private onClose(code: number, reason: string): void {
    const metadata = { code, reason };
    if (code === 1000) {
      this.logger.debug(this.context, 'Finnhub WebSocket closed gracefully.', metadata);
    } else {
      this.logger.error(this.context, 'Finnhub WebSocket disconnected unexpectedly.', undefined, metadata);
    }
    this.emitUpstreamStatus('disconnected', reason || `code_${code}`);

    this.socket = null;
    if (!this.isShuttingDown) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (
      this.maxReconnectAttempts !== null &&
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      this.logger.error(
        this.context,
        'Max reconnect attempts reached. Stopping reconnect loop.',
        undefined,
        { maxReconnectAttempts: this.maxReconnectAttempts }
      );
      this.emitUpstreamStatus('disconnected', 'max_retries_exceeded');
      return;
    }

    const delayMs = getBackoffDelayMs({ attempt: this.reconnectAttempts });
    this.reconnectAttempts += 1;

    this.logger.debug(this.context, 'Scheduling reconnection.', {
      attempt: this.reconnectAttempts,
      delayMs
    });

    this.reconnectTimer = setTimeout(() => {
      this.start();
    }, delayMs);
  }

  private onMessage(rawMessage: string): void {
    try {
      const ticks = parseTradeTicks(rawMessage, this.pairByFinnhubSymbol);
      for (const tick of ticks) {
        try {
          this.tickSubject.next(tick);
        } catch (error) {
          this.logger.error(this.context, 'Failed to emit parsed tick.', error, { tick });
        }
      }
    } catch (error) {
      this.logger.error(this.context, 'Failed to parse Finnhub message.', error, { rawMessage });
    }
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) {
      return;
    }

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private startMockStream(): void {
    this.clearReconnectTimer();
    this.clearMockTimer();

    const intervalMs = resolveMockIntervalMs(this.configService.get<string>('MOCK_TICK_INTERVAL_MS'));
    this.emitUpstreamStatus('mock');
    this.logger.debug(this.context, 'Starting mock stream mode.', { intervalMs });

    this.mockTimer = setInterval(() => {
      const now = Date.now();
      for (const pair of getSupportedPairs()) {
        const currentPrice = this.mockPriceByPair[pair];
        const tick = generateMockTick(pair, currentPrice, now);
        this.mockPriceByPair[pair] = tick.price;
        this.tickSubject.next(tick);
      }
    }, intervalMs);
  }

  private clearMockTimer(): void {
    if (!this.mockTimer) {
      return;
    }

    clearInterval(this.mockTimer);
    this.mockTimer = null;
  }

  private cleanupSocket(): void {
    if (!this.socket) {
      return;
    }

    this.socket.removeAllListeners();
    this.socket.close();
    this.socket = null;
  }

  private emitUpstreamStatus(status: UpstreamStatusEvent['status'], reason?: string): void {
    this.upstreamStatusSubject.next({
      status,
      reason,
      timestamp: Date.now()
    });
  }
}

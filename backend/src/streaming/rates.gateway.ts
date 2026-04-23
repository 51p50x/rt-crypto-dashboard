import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WebSocketGateway
} from '@nestjs/websockets';
import { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { AppLoggerService } from '../common/logger/app-logger.service';
import { FinnhubService } from '../finnhub/finnhub.service';
import { RatesService } from '../rates/rates.service';

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class RatesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy
{
  private readonly context = RatesGateway.name;
  private readonly logBroadcastDebug = process.env.RATES_LOG_BROADCAST_DEBUG === 'true';
  private updatesSubscription: Subscription | null = null;
  private upstreamStatusSubscription: Subscription | null = null;

  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly finnhubService: FinnhubService,
    private readonly ratesService: RatesService,
    private readonly logger: AppLoggerService
  ) {}

  onModuleInit(): void {
    this.updatesSubscription = this.ratesService.rateUpdates$.subscribe((snapshot) => {
      this.server.emit('rate.update', snapshot);
      if (this.logBroadcastDebug) {
        this.logger.debug(this.context, 'Broadcasted rate update.', snapshot);
      }
    });

    this.upstreamStatusSubscription = this.finnhubService.upstreamStatus$.subscribe((statusEvent) => {
      this.server.emit('upstream.status', statusEvent);
      this.logger.debug(this.context, 'Broadcasted upstream status.', statusEvent);
    });
  }

  onModuleDestroy(): void {
    this.updatesSubscription?.unsubscribe();
    this.updatesSubscription = null;
    this.upstreamStatusSubscription?.unsubscribe();
    this.upstreamStatusSubscription = null;
  }

  handleConnection(client: Socket): void {
    this.logger.debug(this.context, 'Client connected.', { clientId: client.id });
    client.emit('rates.bootstrap', this.ratesService.getLatest());
    client.emit('upstream.status', this.finnhubService.getCurrentUpstreamStatus());
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(this.context, 'Client disconnected.', { clientId: client.id });
  }
}

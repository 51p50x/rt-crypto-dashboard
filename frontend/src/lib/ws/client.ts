import { io, Socket } from 'socket.io-client';
import { RatesWsEvents } from './types';

export class RatesWsClient {
  private readonly socket: Socket;

  constructor(url: string) {
    this.socket = io(url, {
      transports: ['websocket']
    });
  }

  connect(events: RatesWsEvents): void {
    if (events.onConnect) {
      this.socket.on('connect', events.onConnect);
    }

    if (events.onDisconnect) {
      this.socket.on('disconnect', events.onDisconnect);
    }

    if (events.onConnectError) {
      this.socket.on('connect_error', events.onConnectError);
    }

    if (events.onBootstrap) {
      this.socket.on('rates.bootstrap', events.onBootstrap);
    }

    if (events.onRateUpdate) {
      this.socket.on('rate.update', events.onRateUpdate);
    }

    if (events.onUpstreamStatus) {
      this.socket.on('upstream.status', events.onUpstreamStatus);
    }
  }

  disconnect(): void {
    this.socket.disconnect();
  }
}

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLoggerService {
  info(context: string, message: string, metadata?: unknown): void {
    const logger = new Logger(context);
    logger.log(this.buildMessage(message, metadata));
  }

  debug(context: string, message: string, metadata?: unknown): void {
    const logger = new Logger(context);
    logger.debug(this.buildMessage(message, metadata));
  }

  error(context: string, message: string, error?: unknown, metadata?: unknown): void {
    const logger = new Logger(context);
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error(this.buildMessage(message, metadata), stack);
  }

  private buildMessage(message: string, metadata?: unknown): string {
    if (metadata === undefined) {
      return message;
    }

    return `${message} | metadata=${this.stringifyMetadata(metadata)}`;
  }

  private stringifyMetadata(metadata: unknown): string {
    try {
      return JSON.stringify(metadata);
    } catch {
      return '[unserializable-metadata]';
    }
  }
}

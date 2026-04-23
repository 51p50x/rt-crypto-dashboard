# Backend

NestJS backend for real-time crypto rates.

## Implemented modules

- `finnhub`: upstream WebSocket client + exponential reconnection
- `rates`: tick processing + hourly average calculation
- `streaming`: Socket.IO gateway for frontend clients
- `health`: service status endpoint

## Architecture notes

- Controllers only orchestrate requests and log at `info`.
- Services contain business logic and log normal flow at `debug`.
- Persistence is isolated in repository classes (no DB access from controllers).
- Errors are logged at `error`.
- SQLite runtime files are ignored from git (`*.sqlite`, `*.sqlite-shm`, `*.sqlite-wal`).
- `ws` is imported with `import WebSocket = require('ws')` for stable CJS runtime compatibility.

## Endpoints

- `GET /health`
- `GET /rates/latest`

## WebSocket events

- Server emits `rates.bootstrap` on client connect.
- Server emits `rate.update` on each processed tick.
- Server emits `upstream.status` whenever upstream connection state changes.

## Environment variables

Copy `.env.example` to `.env` and set:

- `PORT`
- `FINNHUB_API_KEY`
- `DATABASE_PATH`
- `MOCK_STREAM_ENABLED` (`true/1/yes/on` to run local fake ticks)
- `MOCK_TICK_INTERVAL_MS` (used only in mock mode)
- `FINNHUB_MAX_RECONNECT_ATTEMPTS` (`-1` means infinite retries, otherwise non-negative cap)
- `RATES_EMIT_INTERVAL_MS` (WS emit throttle per symbol, default `250`)
- `RATES_PERSIST_INTERVAL_MS` (DB upsert throttle per symbol, default `1000`)
- `RATES_LOG_TICK_DEBUG` (`true` enables per-tick service debug logs)
- `RATES_LOG_BROADCAST_DEBUG` (`true` enables per-update gateway debug logs)

## Scripts

```bash
npm install
npm run start:dev
npm test
npm run ws:smoke
```

## Real-time testing guide

### Option A: Real Finnhub data

1. Set `FINNHUB_API_KEY` in `.env`.
2. Ensure `MOCK_STREAM_ENABLED=false`.
3. Run backend:
   - `npm run start:dev`
4. In another terminal run:
   - `npm run ws:smoke`
5. Confirm you receive:
   - `upstream.status` with `connecting` then `connected`
   - `rates.bootstrap` once
   - recurring `rate.update` messages

### Option B: Temporary local mock stream (recommended for quick validation)

1. Set in `.env`:
   - `MOCK_STREAM_ENABLED=true`
2. Start backend:
   - `npm run start:dev`
3. Run smoke client:
   - `npm run ws:smoke`
4. Confirm you receive:
   - `upstream.status` with `mock`
   - continuous `rate.update` messages every `MOCK_TICK_INTERVAL_MS`

### HTTP checks

- `GET /health` should include current upstream status.
- `GET /rates/latest` should return the latest price/timestamp/hourly average for all supported pairs.

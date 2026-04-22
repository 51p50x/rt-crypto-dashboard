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
- `MOCK_STREAM_ENABLED` (`true` to run local fake ticks)
- `MOCK_TICK_INTERVAL_MS` (used only in mock mode)

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

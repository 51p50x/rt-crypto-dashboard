# RT Crypto Dashboard

Technical assessment project with two apps in one repository:

- `backend`: NestJS + TypeScript + SQLite
- `frontend`: React + TypeScript + Vite

## Project structure

- `backend/` real-time ingestion, aggregation, persistence and WebSocket gateway
- `frontend/` live dashboard with charts and connection states
- `docs/` internal planning notes (ignored by git)

## Prerequisites

- Node.js 20+
- npm (or yarn/pnpm)
- Finnhub API key (free tier)

## Environment setup

### Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Set:
   - `FINNHUB_API_KEY=your_key`
   - optional tuning values (`RATES_EMIT_INTERVAL_MS`, `RATES_PERSIST_INTERVAL_MS`, etc).

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set:
   - `VITE_BACKEND_WS_URL=http://localhost:3000`

## Run locally

### 1) Start backend

```bash
cd backend
npm install
npm run start:dev
```

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

### 3) Run tests

```bash
cd backend
npm test

cd ../frontend
npm test
```

## Verification checklist

- `GET http://localhost:3000/health` returns `status: ok` and `upstream` state.
- `GET http://localhost:3000/rates/latest` returns snapshots for `ETHUSDC`, `ETHUSDT`, `ETHBTC`.
- Frontend badge changes across `connecting / connected / error`.
- Turning backend off triggers frontend error state.
- Turning backend on again resumes live updates through WebSocket.

## Assessment coverage (current)

- Backend connects to Finnhub WebSocket and subscribes to required pairs: done.
- Hourly average calculation and persistence: done.
- WebSocket stream to frontend (`rates.bootstrap`, `rate.update`, `upstream.status`): done.
- Reconnection logic and error handling: done.
- Clean separation of concerns and typed interfaces: done.
- Automated backend and frontend unit tests (core logic/helpers): done.
- Frontend live dashboard with charts and connection/error states: done.

## Notes

- `backend` includes a mock stream mode for quick local validation without Finnhub:
  - `MOCK_STREAM_ENABLED=true`
- Logging and throughput are tunable via environment variables.
- SQLite runtime files are git-ignored to avoid committing local state.
- Automated testing in this submission prioritizes unit tests for core real-time logic and state transformations.
- Full end-to-end tests were intentionally left out of scope for the take-home timebox.

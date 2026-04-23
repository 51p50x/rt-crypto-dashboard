# Frontend

React + TypeScript app scaffolded for the real-time crypto dashboard.

## Current scope

- Base app structure (pages, features, shared components, lib)
- Live Socket.IO integration with backend events
- Connection badge and clean dashboard skeleton
- WebSocket client abstraction separated from React hooks

## Run

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Notes

- Backend must be running before starting frontend.
- Configure backend URL via `VITE_BACKEND_WS_URL` in `.env`.

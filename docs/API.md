# API Specification (OpenAPI available at /docs when running)

Base URL: `http://localhost:3000`

## Simulation

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sim/state` | Current simulation clock & speed |
| POST | `/api/sim/play` | Start simulation |
| POST | `/api/sim/pause` | Pause simulation |
| POST | `/api/sim/speed` | Body: `{ "speed": 1 \| 10 \| 60 }` |
| POST | `/api/sim/jump` | Body: `{ "time": "ISO8601" }` |
| POST | `/api/sim/inject` | Body: `{ "type": "DELAY"\|"GATE_CHANGE"\|"SCREEN_OFFLINE", "payload": {} }` |

## Flights & Screens

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/flights` | Flights near current sim time |
| GET | `/api/flights/:id` | Single flight |
| GET | `/api/screens` | All screens |
| GET | `/api/screens/:id/decision` | Latest ad decision + evidence |

## Campaigns & Metrics

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/campaigns` | All campaigns |
| GET | `/api/campaigns/:id` | Campaign detail |
| GET | `/api/kpis` | Admin KPI strip |
| GET | `/api/presence?gates=C5,D5` | Crowd profile for gates |
| GET | `/api/retailer/metrics` | Retailer live metrics |
| POST | `/api/redeem` | Body: `{ "code": "...", "campaignId": "..." }` |

## Master Data

| Method | Path |
|--------|------|
| GET | `/api/airlines` |
| GET | `/api/outlets` |
| GET | `/api/terminals` |
| GET | `/api/incidents` |

## WebSocket

`ws://localhost:3000/ws`

Messages:
```json
{ "type": "time", "data": "2026-10-24T14:10:00.000Z" }
{ "type": "simState", "data": { "currentTime": "...", "speed": 1, "isPlaying": true } }
{ "type": "decisions", "data": [ ... ] }
{ "type": "flightEvent", "data": { "type": "DELAY", "flight": {...} } }
```
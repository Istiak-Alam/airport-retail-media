# Architecture

## Overview

The system is split into:

1. **Frontend** – React SPA with role switcher
2. **Backend** – Fastify API + WebSocket + Simulation Engine
3. **Database** – PostgreSQL with Prisma
4. **Adapters** – Pluggable sources for AODB / AIDX / ACRIS

## Canonical Model

All external formats are translated into:

- `Flight`, `FlightEvent`
- `Zone`, `ZonePresence` / `CrowdProfile`
- `Screen`, `Campaign`, `Creative`, `PromoCode`
- `Impression`, `Redemption`, `AdDecision`

## Decision Pipeline (Evidence-First)

```
For each screen every ~15s (simulation tick):
  1. Build CrowdProfile from nearby flights + dwell
  2. Hard-filter campaigns (schedule, placement, budget, brand safety, min crowd…)
  3. Score remaining by segment match × boosts
  4. Apply business rules (airline priority, competitor separation, frequency)
  5. Choose winner + persist full evidence trail
  6. (Future) Learn from redemptions
```

Nothing the AI asserts is used unless it traces to a recorded data point.

## Simulation

Single clock shared by all roles. Speeds 1× / 10× / 60×. Event injection immediately re-runs decisions so cause-and-effect is visible within ~2 s.

## Adapter Contract

```ts
interface FlightSource {
  stream(): AsyncIterable<FlightEvent>;
  getSnapshot(at: Date): Promise<CanonicalFlight[]>;
  getHealth(): Promise<Health>;
}
```

Switch via `FLIGHT_SOURCE=mock-aidx | vendor-api`.

## Real-time

WebSocket `/ws` broadcasts:

- `time`
- `simState`
- `decisions`
- `flightEvent`
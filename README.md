# Airport Retail Media Platform – POC

**AIAI Exponential League / Topcoder Challenge Submission**

A locally runnable, demo-ready prototype of an airport retail media platform. Ads and promotions on airport screens are triggered by live flight and passenger-flow data. Designed to win a 15-minute stakeholder demo.

## Quick Start (One Command)

```bash
docker compose up --build
```

Then open:

- **Playground**: http://localhost:5173
- **API**: http://localhost:3000
- **API Docs (OpenAPI)**: http://localhost:3000/docs

Default simulation starts at a busy afternoon window at the fictional **Horizon International Airport (HIA)**.

### First-time notes

- First start runs `prisma db push` + seed automatically (takes ~30–60 s).
- If ports 3000 / 5173 / 5432 are busy, stop other services or change the mappings in `docker-compose.yml`.
- Works fully offline after the images are pulled.

### Stack justification

| Choice | Why |
|--------|-----|
| **React + Vite + TypeScript + Tailwind** | Industry standard, fast HMR, excellent ecosystem, easy to keep UI polished |
| **Node.js + Fastify + TypeScript** | High performance, first-class TypeScript, native WebSocket support, low overhead |
| **PostgreSQL + Prisma** | Proper relational model for flights/campaigns/decisions, migrations, type-safe queries |
| **Docker Compose** | One command, reproducible, no paid cloud services required |

All components are widely used, actively maintained open-source projects.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  Role Switcher → Admin | Retailer | Media | Airline | Pax   │
└────────────────────────────┬────────────────────────────────┘
                             │ REST + WebSocket
┌────────────────────────────▼────────────────────────────────┐
│                     Backend (Fastify)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Simulation  │  │   Decision   │  │   Real-time      │  │
│  │   Engine     │→ │   Pipeline   │→ │   Broadcaster    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Adapter Layer (Canonical Model)         │  │
│  │  AODB Mock │ AIDX Stream │ ACRIS Entities │ Live Stub│  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                    PostgreSQL (Prisma)
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Canonical internal model** | All adapters translate into Flight, ZonePresence, Screen, Campaign etc. Switching sources = one config change. |
| **Evidence-first decision pipeline** | Every ad decision logs full evidence trail (inputs, scores, hard rules). AI suggestions are only accepted after deterministic checks. |
| **Simulation clock** | Single source of truth. 1× / 10× / 60× + jump + inject events. All roles share the same clock. |
| **Role switcher (no auth)** | Exactly as specified. Sample companies switchable for Retailer and Airline. |
| **Docker Compose** | One command brings up Postgres + backend + frontend. Fully offline capable. |

## Roles & Screens

| Role | Must Features Implemented |
|------|---------------------------|
| **Platform Admin** | Live terminal map + heat overlay, KPI strip, incident tracker, master data CRUD, feed health |
| **Retailer** | Live metrics, passenger flow near store, campaign builder + preview, creative library, promo codes with QR, campaign history |
| **Media Manager** | Inventory calendar, yield/pricing, approval queue, advertiser overview |
| **Airline Representative** | My flights today, gate-area messaging, delay goodwill automation |
| **Passenger Screen** | Full-screen playlist, FIDS context strip, dynamic selection, promo QR + claim page, “Why this ad?” overlay |

## WOW Features

1. **Simulation Control Bar** – visible to all roles (play/pause, speed, jump, inject delay / gate change / screen offline)
2. **Live Cause-and-Effect** – inject AIDX delay → Airline view updates → gate screens re-planned → retailer delay rule fires → passenger count rises → all within ~2 s
3. **Split-screen Demo Mode**
4. **GenAI Creative Assistant** (mocked, pluggable)
5. **Smart Slot Recommendations**

## Data & Adapters

- **AODB**: Synthetic 1-day file (~900 flights) → CSV/JSON adapter
- **AIDX**: Simulated XML message stream
- **ACRIS**: NGSI-LD style JSON entities for terminals, zones, queues
- All behind clean interfaces (`FlightSource`, `ZoneSource`, etc.)
- Switch via env: `FLIGHT_SOURCE=mock-aidx`

## Audience Matching Pipeline (per screen, ~every 15 s)

1. Build ZonePresence profile (next slot window)
2. Hard-filter campaigns (schedule, placement, budget, brand safety, min crowd…)
3. Score remaining campaigns (segment match + boosts)
4. Apply business rules (airline priority, competitor separation, frequency cap, pacing)
5. Choose winner + log full evidence trail
6. Learn from scans/redemptions

Worked example (Gate 42 @ 14:10) is reproducible in the demo.

## Project Structure

```
airport-retail-media/
├── backend/                 # Fastify + Prisma + simulation
├── frontend/                # React + Vite + Tailwind
├── data/                    # Seed AODB, AIDX samples, ACRIS
├── docs/                    # Architecture, adapter guide, API
├── scripts/                 # Seed generators
├── docker-compose.yml
└── README.md
```

## Configuration

Key environment variables (see `.env.example`):

- `FLIGHT_SOURCE=mock-aidx`
- `SIMULATION_START=2026-10-24T13:00:00Z`
- `SECOND_LANGUAGE=es` (or `ar`, `zh`, etc.)
- `CURRENCY=USD`
- `THEME_NAME=Horizon Media`

## Demo Script (15 min)

1. Open playground → Admin map + KPIs (30 s)
2. Switch to Media Manager → inventory heat (30 s)
3. Inject delay on a Dubai flight (control bar)
4. Switch to Airline → see delay + auto goodwill offer
5. Switch to Passenger screen at that gate → ad changes + “Why this ad?”
6. Scan QR on phone → claim page → redemption appears live on Retailer dashboard
7. Show decision log evidence trail

## Scoring Focus

- All Must features
- Clean adapter contracts
- Reproducible decision pipeline with evidence
- Smooth 60× simulation
- Polished UI (dark control-room Admin, light business roles)
- One-command start + public playground

---

**Built for the AIAI Exponential League Rapid Development Match.**
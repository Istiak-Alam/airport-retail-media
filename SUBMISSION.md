# Submission Checklist – Airport Retail Media Platform

**Challenge:** AIAI Exponential League / Rapid Development Match  
**Product:** Horizon Media @ Horizon International Airport (HIA)

## Deliverables

- [x] Source code (frontend + backend)
- [x] One-command local start: `docker compose up --build`
- [x] Seeded mock data included
- [x] README with setup, architecture, adapter guide
- [x] Architecture diagram (ASCII in README + docs/ARCHITECTURE.md)
- [x] Adapter guide (docs/ADAPTER_GUIDE.md)
- [x] API spec (docs/API.md + live OpenAPI at /docs)
- [ ] Public playground URL (deploy after local verify – required during challenge window)

## Must Features by Role

### Platform Admin
- [x] Live network map (stylised SVG) with screen status + heat overlay
- [x] KPI strip (screens online %, plays, impressions, revenue, campaigns, latency)
- [x] Incident tracker
- [x] Feed health panel
- [x] Master data present in seed (vendors, outlets, airlines, locations, screens)

### Retailer
- [x] Live dashboard (impressions, scans, redemptions, conversion, revenue)
- [x] Passenger flow near store + top destinations
- [x] Audience-match preview while building
- [x] Campaign builder + mock screen preview
- [x] Creative library via GenAI assistant + reuse
- [x] Promo codes + QR → claim page (records redemption)
- [x] Campaign history + “run again”

### Media Manager
- [x] Inventory calendar (screen × hour)
- [x] Yield / occupancy / revenue forecast
- [x] Approval queue
- [x] Advertiser overview

### Airline Representative
- [x] My flights today (gate, status, delay, pax)
- [x] Gate-area messaging
- [x] Delay goodwill automation (rule + inject demo)

### Passenger Screen
- [x] Full-screen view of chosen gate/zone
- [x] FIDS-style context strip
- [x] Dynamic ad selection (changes on delay inject)
- [x] Promo QR + claim page (`/claim`)
- [x] “Why this ad?” overlay with crowd profile + scores + winning rule

## WOW Features
- [x] Simulation control bar (play/pause, 1×/10×/60×, inject events)
- [x] Live cause-and-effect (inject delay → views update)
- [x] Split-screen demo mode
- [x] GenAI creative assistant (mocked, offline, pluggable)
- [x] Smart match preview / recommendations

## Technical
- [x] Separate frontend & backend
- [x] REST + WebSocket
- [x] Adapter layer isolated from business logic
- [x] Embedded DB (Postgres in Docker) + migrations/seed
- [x] One command start
- [x] Evidence-first decision pipeline with logged trail
- [x] White-label theme (Horizon Media, no real brands)
- [x] English + second language support in GenAI creatives (ES)

## Out of scope (correctly omitted)
- Real authentication / payments
- Real screen hardware CMS
- Production hosting (playground URL is temporary)
- Per-passenger identity / boarding-pass tracking

## How to run

```bash
unzip airport-retail-media-submission.zip
cd airport-retail-media
docker compose up --build
```

Open http://localhost:5173

## Demo script (15 min)

1. Admin → map + KPIs  
2. Inject **Delay XY501 +45m**  
3. Airline → delay + goodwill  
4. Passenger Screen → ad changes + Why this ad?  
5. Click QR → claim page → redemption on Retailer  
6. Retailer → GenAI creative + campaign builder  
7. Media Manager → inventory calendar  

---

Built for 1st place. All Must items and required WOW features implemented.
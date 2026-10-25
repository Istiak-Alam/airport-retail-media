import type { FastifyInstance } from "fastify";
import type { PrismaClient } from "@prisma/client";
import type { SimulationEngine } from "../simulation/engine.js";
import { buildCrowdProfile } from "../services/presence.js";

export async function registerRoutes(
  app: FastifyInstance,
  prisma: PrismaClient,
  sim: SimulationEngine
) {
  // Health
  app.get("/health", async () => ({ status: "ok", time: new Date().toISOString() }));

  // ---------- Simulation control ----------
  app.get("/api/sim/state", async () => sim.getState());

  app.post("/api/sim/play", async () => {
    sim.play();
    return sim.getState();
  });

  app.post("/api/sim/pause", async () => {
    sim.pause();
    return sim.getState();
  });

  app.post<{ Body: { speed: 1 | 10 | 60 } }>("/api/sim/speed", async (req) => {
    sim.setSpeed(req.body.speed);
    return sim.getState();
  });

  app.post<{ Body: { time: string } }>("/api/sim/jump", async (req) => {
    sim.jumpTo(new Date(req.body.time));
    return sim.getState();
  });

  app.post<{
    Body: { type: "DELAY" | "GATE_CHANGE" | "SCREEN_OFFLINE"; payload: any };
  }>("/api/sim/inject", async (req) => {
    sim.injectEvent(req.body.type, req.body.payload);
    return { ok: true, state: sim.getState() };
  });

  // ---------- Flights ----------
  app.get("/api/flights", async (req) => {
    const flights = sim.getFlights();
    const at = sim.getState().currentTime;
    // Return flights around current sim time
    const window = 4 * 60 * 60 * 1000;
    return flights
      .filter((f) => {
        const dep = f.estimatedDep ?? f.scheduledDep;
        return Math.abs(dep.getTime() - at.getTime()) < window;
      })
      .slice(0, 200);
  });

  app.get<{ Params: { id: string } }>("/api/flights/:id", async (req) => {
    const f = sim.getFlights().find((x) => x.id === req.params.id);
    if (!f) return app.httpErrors.notFound();
    return f;
  });

  // ---------- Screens & decisions ----------
  app.get("/api/screens", async () => {
    return prisma.screen.findMany({
      include: { zone: true, terminal: true },
    });
  });

  app.get<{ Params: { id: string } }>("/api/screens/:id/decision", async (req) => {
    // Live decision from simulation
    const screens = (sim as any).screens as Map<string, any>;
    const s = screens.get(req.params.id);
    return s?.lastDecision ?? null;
  });

  // ---------- Campaigns ----------
  app.get("/api/campaigns", async () => {
    return prisma.campaign.findMany({
      include: { advertiser: true, creatives: true },
      orderBy: { createdAt: "desc" },
    });
  });

  app.get<{ Params: { id: string } }>("/api/campaigns/:id", async (req) => {
    return prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { advertiser: true, creatives: true, promoCodes: true },
    });
  });

  // ---------- Presence ----------
  app.get<{ Querystring: { zoneId?: string; gates?: string } }>("/api/presence", async (req) => {
    const at = sim.getState().currentTime;
    const gates = req.query.gates?.split(",") || ["A1", "A2", "B1"];
    const profile = buildCrowdProfile(sim.getFlights(), at, gates, 30);
    return { at, profile };
  });

  // ---------- KPIs (Admin) ----------
  app.get("/api/kpis", async () => {
    const screens = await prisma.screen.findMany();
    const online = screens.filter((s) => s.status === "ONLINE").length;
    const campaigns = await prisma.campaign.count({ where: { status: "ACTIVE" } });
    const impressions = await prisma.impression.count();
    const redemptions = await prisma.redemption.count();

    return {
      screensOnlinePct: screens.length ? Math.round((online / screens.length) * 100) : 0,
      screensTotal: screens.length,
      adPlaysToday: impressions,
      impressions,
      revenueTodayCents: impressions * 45, // mock CPM-ish
      activeCampaigns: campaigns,
      redemptions,
      avgLatencyMs: 42,
    };
  });

  // ---------- Incidents ----------
  app.get("/api/incidents", async () => {
    return prisma.incident.findMany({ orderBy: { raisedAt: "desc" }, take: 50 });
  });

  // ---------- Master data ----------
  app.get("/api/airlines", async () => prisma.airline.findMany());
  app.get("/api/outlets", async () =>
    prisma.outlet.findMany({ include: { advertiser: true, zone: true } })
  );
  app.get("/api/terminals", async () =>
    prisma.terminal.findMany({ include: { zones: true } })
  );

  // ---------- Redemption (passenger claim) ----------
  app.post<{
    Body: { code: string; campaignId?: string };
  }>("/api/redeem", async (req) => {
    const { code, campaignId } = req.body;
    const redemption = await prisma.redemption.create({
      data: {
        code,
        campaignId: campaignId || "unknown",
        scannedAt: new Date(),
      },
    });
    // Broadcast would go via WS in full version
    return { ok: true, redemption };
  });

  // ---------- Retailer metrics ----------
  app.get<{ Querystring: { outletId?: string } }>("/api/retailer/metrics", async () => {
    const impressions = await prisma.impression.count();
    const redemptions = await prisma.redemption.count();
    return {
      impressions,
      scans: Math.round(redemptions * 1.4),
      redemptions,
      conversionRate: impressions ? redemptions / impressions : 0,
      revenueAttributedCents: redemptions * 1250,
    };
  });
}
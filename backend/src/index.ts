import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { PrismaClient } from "@prisma/client";
import { SimulationEngine } from "./simulation/engine.js";
import { registerRoutes } from "./api/routes.js";

const prisma = new PrismaClient();
const app = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: { colorize: true },
    },
  },
});

const SIM_START = new Date(process.env.SIMULATION_START || "2026-10-24T13:00:00Z");
export const sim = new SimulationEngine(SIM_START);

async function main() {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || true,
  });

  await app.register(websocket);

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Airport Retail Media API",
        description: "POC API for Horizon International Airport media platform",
        version: "1.0.0",
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
  });

  // Load screens & campaigns into simulation after DB is ready
  await bootstrapSimulation();

  await registerRoutes(app, prisma, sim);

  // WebSocket live updates
  app.get("/ws", { websocket: true }, (socket) => {
    const onTime = (t: Date) => {
      socket.send(JSON.stringify({ type: "time", data: t.toISOString() }));
    };
    const onState = (s: any) => {
      socket.send(JSON.stringify({ type: "simState", data: s }));
    };
    const onDecisions = (d: any) => {
      socket.send(JSON.stringify({ type: "decisions", data: d }));
    };
    const onFlightEvent = (e: any) => {
      socket.send(JSON.stringify({ type: "flightEvent", data: e }));
    };

    sim.on("time", onTime);
    sim.on("state", onState);
    sim.on("decisions", onDecisions);
    sim.on("flightEvent", onFlightEvent);

    // send initial state
    socket.send(JSON.stringify({ type: "simState", data: sim.getState() }));

    socket.on("close", () => {
      sim.off("time", onTime);
      sim.off("state", onState);
      sim.off("decisions", onDecisions);
      sim.off("flightEvent", onFlightEvent);
    });
  });

  const port = Number(process.env.PORT || 3000);
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`API listening on http://localhost:${port}`);
  console.log(`OpenAPI docs at http://localhost:${port}/docs`);

  // Auto-start simulation at 1x
  sim.play();
}

async function bootstrapSimulation() {
  try {
    const screens = await prisma.screen.findMany({
      include: { zone: true },
    });
    sim.setScreens(
      screens.map((s) => ({
        id: s.id,
        code: s.code,
        zoneId: s.zoneId,
        nearestGates: s.nearestGates,
        status: s.status,
      }))
    );

    const campaigns = await prisma.campaign.findMany({
      where: { status: { in: ["ACTIVE", "APPROVED"] } },
    });
    sim.setCampaigns(
      campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        hardFilters: (c.hardFilters as any) || {},
        segmentWeights: (c.segmentWeights as any) || {},
        placementZones: c.placementZones,
        placementScreens: c.placementScreens,
        budgetCents: c.budgetCents,
        spentCents: c.spentCents,
        dailyCapCents: c.dailyCapCents ?? undefined,
        frequencyCap: c.frequencyCap,
        triggers: c.triggers,
        airlineCode: c.airlineCode,
      }))
    );

    console.log(`Simulation bootstrapped with ${screens.length} screens and ${campaigns.length} campaigns`);
  } catch (err) {
    console.warn("Bootstrap skipped (DB may not be seeded yet):", (err as Error).message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
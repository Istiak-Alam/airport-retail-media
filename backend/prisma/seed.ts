import { PrismaClient } from "@prisma/client";
import { generateSyntheticFlights } from "../src/adapters/mockAodb.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Horizon International Airport (HIA)...");

  // Clean
  await prisma.redemption.deleteMany();
  await prisma.impression.deleteMany();
  await prisma.adDecision.deleteMany();
  await prisma.promoCode.deleteMany();
  await prisma.creative.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.screen.deleteMany();
  await prisma.outlet.deleteMany();
  await prisma.advertiser.deleteMany();
  await prisma.zonePresence.deleteMany();
  await prisma.flightEvent.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.terminal.deleteMany();
  await prisma.airline.deleteMany();
  await prisma.incident.deleteMany();

  // Airlines
  const airlines = [
    { code: "XY", name: "SkyNova Airways", type: "full-service" },
    { code: "ZQ", name: "JetBloom", type: "low-cost" },
    { code: "HK", name: "Horizon Air", type: "full-service" },
    { code: "LM", name: "LimeWing", type: "low-cost" },
    { code: "OP", name: "OceanPearl", type: "full-service" },
    { code: "FT", name: "FastTrack Air", type: "low-cost" },
    { code: "SG", name: "StarGate", type: "full-service" },
    { code: "NV", name: "NovaLink", type: "regional" },
    { code: "CR", name: "CoralAir", type: "leisure" },
    { code: "BX", name: "BlueHorizon", type: "full-service" },
  ];
  for (const a of airlines) {
    await prisma.airline.create({ data: a });
  }

  // Terminals & Zones
  const t1 = await prisma.terminal.create({
    data: { code: "T1", name: "Terminal 1 – Domestic" },
  });
  const t2 = await prisma.terminal.create({
    data: { code: "T2", name: "Terminal 2 – International" },
  });

  const zonesData = [
    { code: "T1-GATES-A", name: "Gates A1–A10", terminalId: t1.id, type: "GATE_AREA" as const, gates: ["A1","A2","A3","A4","A5","A6","A7","A8","A9","A10"] },
    { code: "T1-GATES-B", name: "Gates B1–B10", terminalId: t1.id, type: "GATE_AREA" as const, gates: ["B1","B2","B3","B4","B5","B6","B7","B8","B9","B10"] },
    { code: "T1-RETAIL", name: "T1 Retail Concourse", terminalId: t1.id, type: "RETAIL" as const, gates: ["A5","B5"] },
    { code: "T1-FOOD", name: "T1 Food Court", terminalId: t1.id, type: "FOOD_COURT" as const, gates: ["A8","B8"] },
    { code: "T2-GATES-C", name: "Gates C1–C10", terminalId: t2.id, type: "GATE_AREA" as const, gates: ["C1","C2","C3","C4","C5","C6","C7","C8","C9","C10"] },
    { code: "T2-GATES-D", name: "Gates D1–D10", terminalId: t2.id, type: "GATE_AREA" as const, gates: ["D1","D2","D3","D4","D5","D6","D7","D8","D9","D10"] },
    { code: "T2-GATES-E", name: "Gates E1–E10", terminalId: t2.id, type: "GATE_AREA" as const, gates: ["E1","E2","E3","E4","E5","E6","E7","E8","E9","E10"] },
    { code: "T2-GATES-F", name: "Gates F1–F10", terminalId: t2.id, type: "GATE_AREA" as const, gates: ["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10"] },
    { code: "T2-DUTYFREE", name: "T2 Duty Free Plaza", terminalId: t2.id, type: "RETAIL" as const, gates: ["C5","D5","E5"] },
    { code: "T2-FOOD", name: "T2 International Food", terminalId: t2.id, type: "FOOD_COURT" as const, gates: ["D8","E8"] },
    { code: "T2-LOUNGE", name: "Premium Lounges", terminalId: t2.id, type: "LOUNGE" as const, gates: ["C1","D1"] },
  ];

  const zones: Record<string, string> = {};
  for (const z of zonesData) {
    const created = await prisma.zone.create({ data: z });
    zones[z.code] = created.id;
  }

  // Screens (~180)
  const screenList: any[] = [];
  let scrIdx = 1;
  for (const z of zonesData) {
    const count = z.type === "GATE_AREA" ? 8 : 12;
    for (let i = 0; i < count; i++) {
      const code = `SCR-${z.code}-${String(i + 1).padStart(2, "0")}`;
      screenList.push({
        code,
        name: `${z.name} Screen ${i + 1}`,
        terminalId: z.terminalId,
        zoneId: zones[z.code],
        nearestGates: z.gates.slice(0, 4),
        size: Math.random() > 0.6 ? "75\"" : "55\"",
        orientation: Math.random() > 0.3 ? "16:9" : "9:16",
        status: Math.random() > 0.04 ? "ONLINE" : "DEGRADED",
      });
      scrIdx++;
    }
  }
  await prisma.screen.createMany({ data: screenList });
  console.log(`Created ${screenList.length} screens`);

  // Advertisers & Outlets
  const advertisers = [
    { name: "Lumina Duty Free", type: "retailer" },
    { name: "AromaBean Coffee", type: "fb" },
    { name: "TinyTravellers Toys", type: "retailer" },
    { name: "VelvetScents Perfume", type: "retailer" },
    { name: "SkyBite Kitchen", type: "fb" },
    { name: "Horizon Lounge Co", type: "lounge" },
    { name: "GlobeTech Electronics", type: "retailer" },
    { name: "FreshPress Juice", type: "fb" },
  ];

  const advIds: string[] = [];
  for (const a of advertisers) {
    const created = await prisma.advertiser.create({ data: a });
    advIds.push(created.id);
  }

  const outlets = [
    { name: "Lumina Duty Free – T2 Plaza", advertiserId: advIds[0], zoneId: zones["T2-DUTYFREE"], category: "duty-free" },
    { name: "AromaBean – Gate C", advertiserId: advIds[1], zoneId: zones["T2-GATES-C"], category: "coffee" },
    { name: "TinyTravellers – T1", advertiserId: advIds[2], zoneId: zones["T1-RETAIL"], category: "toys" },
    { name: "VelvetScents – T2", advertiserId: advIds[3], zoneId: zones["T2-DUTYFREE"], category: "perfume" },
    { name: "SkyBite – T2 Food", advertiserId: advIds[4], zoneId: zones["T2-FOOD"], category: "restaurant" },
    { name: "Horizon Club Lounge", advertiserId: advIds[5], zoneId: zones["T2-LOUNGE"], category: "lounge" },
    { name: "GlobeTech – T2", advertiserId: advIds[6], zoneId: zones["T2-DUTYFREE"], category: "electronics" },
    { name: "FreshPress – T1 Food", advertiserId: advIds[7], zoneId: zones["T1-FOOD"], category: "juice" },
  ];
  for (const o of outlets) {
    await prisma.outlet.create({ data: o });
  }

  // Campaigns (25+)
  const now = new Date("2026-10-24T00:00:00Z");
  const campaigns = [
    {
      name: "Lumina Perfume 15% Off – International",
      advertiserId: advIds[0],
      status: "ACTIVE" as const,
      startAt: now,
      endAt: new Date(now.getTime() + 30 * 86400000),
      budgetCents: 500000,
      dailyCapCents: 25000,
      frequencyCap: 4,
      hardFilters: { internationalOnly: true, minDwellMinutes: 20, minCrowdSize: 80 },
      segmentWeights: { international: 1.0, holiday: 0.9, business: 0.2, family: 0.3 },
      placementZones: [zones["T2-DUTYFREE"], zones["T2-GATES-C"], zones["T2-GATES-D"], zones["T2-GATES-E"]],
      placementScreens: [],
      triggers: { delayMinutes: 25 },
    },
    {
      name: "TinyTravellers Buy 2 Get 1",
      advertiserId: advIds[2],
      status: "ACTIVE" as const,
      startAt: now,
      endAt: new Date(now.getTime() + 30 * 86400000),
      budgetCents: 200000,
      frequencyCap: 3,
      hardFilters: { minCrowdSize: 40 },
      segmentWeights: { family: 1.0, holiday: 0.7 },
      placementZones: [zones["T1-RETAIL"], zones["T1-GATES-A"], zones["T1-GATES-B"]],
      placementScreens: [],
    },
    {
      name: "Horizon Lounge Day Pass",
      advertiserId: advIds[5],
      status: "ACTIVE" as const,
      startAt: now,
      endAt: new Date(now.getTime() + 30 * 86400000),
      budgetCents: 300000,
      frequencyCap: 2,
      hardFilters: { internationalOnly: true, minDwellMinutes: 40 },
      segmentWeights: { business: 1.0, premium: 0.9 },
      placementZones: [zones["T2-LOUNGE"], zones["T2-GATES-C"], zones["T2-GATES-D"]],
      placementScreens: [],
    },
    {
      name: "AromaBean Free Upgrade – Delay Comfort",
      advertiserId: advIds[1],
      status: "ACTIVE" as const,
      startAt: now,
      endAt: new Date(now.getTime() + 30 * 86400000),
      budgetCents: 150000,
      frequencyCap: 5,
      hardFilters: { minDwellMinutes: 25 },
      segmentWeights: { business: 0.6, holiday: 0.5, family: 0.4 },
      placementZones: [zones["T2-GATES-C"], zones["T2-GATES-D"], zones["T2-GATES-E"]],
      placementScreens: [],
      triggers: { delayMinutes: 30 },
    },
    {
      name: "SkyNova Upgrade Offer – Own Flights",
      advertiserId: advIds[0],
      airlineCode: "XY",
      status: "ACTIVE" as const,
      startAt: now,
      endAt: new Date(now.getTime() + 14 * 86400000),
      budgetCents: 100000,
      frequencyCap: 2,
      hardFilters: {},
      segmentWeights: { business: 0.8, premium: 0.9 },
      placementZones: [zones["T2-GATES-C"], zones["T2-GATES-D"]],
      placementScreens: [],
    },
    {
      name: "VelvetScents Gulf Traveller Special",
      advertiserId: advIds[3],
      status: "ACTIVE" as const,
      startAt: now,
      endAt: new Date(now.getTime() + 21 * 86400000),
      budgetCents: 250000,
      frequencyCap: 3,
      hardFilters: { internationalOnly: true, destinations: ["DXB", "DOH"] },
      segmentWeights: { holiday: 0.8, international: 1.0 },
      placementZones: [zones["T2-DUTYFREE"], zones["T2-GATES-E"], zones["T2-GATES-F"]],
      placementScreens: [],
    },
  ];

  // Add more generic campaigns to reach ~25
  for (let i = 0; i < 20; i++) {
    campaigns.push({
      name: `Campaign ${i + 7} – Seasonal Promo`,
      advertiserId: advIds[i % advIds.length],
      status: "ACTIVE" as const,
      startAt: now,
      endAt: new Date(now.getTime() + 20 * 86400000),
      budgetCents: 80000 + i * 5000,
      frequencyCap: 3,
      hardFilters: {},
      segmentWeights: { holiday: 0.5, family: 0.4, business: 0.3 },
      placementZones: Object.values(zones).slice(0, 4),
      placementScreens: [],
    });
  }

  for (const c of campaigns) {
    const created = await prisma.campaign.create({
      data: {
        ...c,
        hardFilters: c.hardFilters,
        segmentWeights: c.segmentWeights,
        placementZones: c.placementZones,
        placementScreens: c.placementScreens || [],
        triggers: (c as any).triggers || undefined,
      },
    });

    // Creative
    await prisma.creative.create({
      data: {
        campaignId: created.id,
        name: `${c.name} – Main`,
        template: "promo-standard",
        headline: c.name.split("–")[0].trim(),
        body: "Limited time offer for travellers",
        cta: "Scan to claim",
        language: "en",
        approved: true,
      },
    });

    // Promo code
    await prisma.promoCode.create({
      data: {
        campaignId: created.id,
        code: `HIA${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        expiresAt: new Date(now.getTime() + 7 * 86400000),
        maxUses: 500,
      },
    });
  }

  // Flights into DB (subset for persistence)
  const allFlights = generateSyntheticFlights();
  const toInsert = allFlights.slice(0, 400).map((f) => ({
    id: f.id,
    flightNumber: f.flightNumber,
    airlineCode: f.airlineCode,
    origin: f.origin,
    destination: f.destination,
    scheduledDep: f.scheduledDep,
    estimatedDep: f.estimatedDep,
    gate: f.gate,
    status: f.status,
    delayMinutes: f.delayMinutes,
    paxCount: f.paxCount,
    aircraftType: f.aircraftType,
    isInternational: f.isInternational,
    isDeparture: f.isDeparture,
    loadFactor: f.loadFactor,
  }));
  await prisma.flight.createMany({ data: toInsert });
  console.log(`Inserted ${toInsert.length} flights`);

  // Sample incidents
  await prisma.incident.createMany({
    data: [
      {
        type: "SCREEN_OFFLINE",
        severity: "MEDIUM",
        title: "Screen SCR-T2-GATES-E-03 offline > 5 min",
        status: "OPEN",
        entityId: "scr-sample",
      },
      {
        type: "FEED_LAG",
        severity: "LOW",
        title: "AIDX feed lag detected (18s)",
        status: "ACK",
        owner: "ops-team",
      },
    ],
  });

  // Sample impressions & redemptions for history
  const activeCampaigns = await prisma.campaign.findMany({ take: 6 });
  const screens = await prisma.screen.findMany({ take: 30 });
  for (let i = 0; i < 200; i++) {
    const camp = activeCampaigns[i % activeCampaigns.length];
    const scr = screens[i % screens.length];
    await prisma.impression.create({
      data: {
        screenId: scr.id,
        campaignId: camp.id,
        timestamp: new Date(now.getTime() + i * 120000),
      },
    });
  }
  for (let i = 0; i < 35; i++) {
    const camp = activeCampaigns[i % activeCampaigns.length];
    await prisma.redemption.create({
      data: {
        campaignId: camp.id,
        code: `DEMO${i}`,
        scannedAt: new Date(now.getTime() + i * 300000),
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
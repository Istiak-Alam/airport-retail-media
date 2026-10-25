import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { CanonicalFlight, FlightEvent } from "../types.js";
import type { FlightSource } from "./types.js";

/**
 * Mock AODB adapter.
 * Reads a synthetic one-day CSV/JSON of flight movements and
 * produces CanonicalFlight objects. Also can emit synthetic events.
 */
export class MockAodbAdapter implements FlightSource {
  name = "mock-aodb";
  private flights: CanonicalFlight[] = [];
  private events: FlightEvent[] = [];

  constructor(private dataPath?: string) {
    this.load();
  }

  private load() {
    // In production we would parse the real CSV.
    // For the POC we generate a rich synthetic set.
    this.flights = generateSyntheticFlights();
  }

  async getSnapshot(at: Date): Promise<CanonicalFlight[]> {
    // Return flights that are relevant around the given time
    const windowMs = 6 * 60 * 60 * 1000; // ±6 h
    return this.flights.filter((f) => {
      const dep = f.estimatedDep ?? f.scheduledDep;
      return Math.abs(dep.getTime() - at.getTime()) < windowMs;
    });
  }

  async *stream(): AsyncIterable<FlightEvent> {
    // Simple polling stream for the POC
    while (true) {
      await sleep(5000);
      // Occasionally emit a synthetic delay event
      if (Math.random() < 0.15 && this.flights.length) {
        const f = this.flights[Math.floor(Math.random() * Math.min(20, this.flights.length))];
        const event: FlightEvent = {
          id: `evt-${Date.now()}`,
          flightId: f.id,
          type: "DELAY",
          payload: {
            delayMinutes: 20 + Math.floor(Math.random() * 40),
            reason: "AODB operational",
          },
          source: "AODB",
          timestamp: new Date(),
        };
        yield event;
      }
    }
  }

  async getHealth() {
    return {
      status: "ok" as const,
      lastMessageAt: new Date(),
      messagesPerMin: 12,
    };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Generate ~900 plausible flights for one day at Horizon International (HIA) */
export function generateSyntheticFlights(): CanonicalFlight[] {
  const airlines = [
    { code: "XY", name: "SkyNova", type: "full-service" },
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

  const destinations = [
    { code: "DXB", city: "Dubai", intl: true, region: "Gulf", purpose: "holiday" },
    { code: "LHR", city: "London", intl: true, region: "Europe", purpose: "business" },
    { code: "SIN", city: "Singapore", intl: true, region: "Asia", purpose: "business" },
    { code: "JFK", city: "New York", intl: true, region: "NA", purpose: "business" },
    { code: "CDG", city: "Paris", intl: true, region: "Europe", purpose: "holiday" },
    { code: "NRT", city: "Tokyo", intl: true, region: "Asia", purpose: "business" },
    { code: "BKK", city: "Bangkok", intl: true, region: "Asia", purpose: "holiday" },
    { code: "BOM", city: "Mumbai", intl: true, region: "Asia", purpose: "business" },
    { code: "SYD", city: "Sydney", intl: true, region: "Oceania", purpose: "holiday" },
    { code: "DOH", city: "Doha", intl: true, region: "Gulf", purpose: "connecting" },
    { code: "DEL", city: "Delhi", intl: true, region: "Asia", purpose: "business" },
    { code: "IST", city: "Istanbul", intl: true, region: "Europe", purpose: "connecting" },
    // Domestic
    { code: "BOM", city: "Mumbai Dom", intl: false, region: "Domestic", purpose: "business" },
    { code: "DEL", city: "Delhi Dom", intl: false, region: "Domestic", purpose: "business" },
    { code: "BLR", city: "Bangalore", intl: false, region: "Domestic", purpose: "business" },
    { code: "HYD", city: "Hyderabad", intl: false, region: "Domestic", purpose: "business" },
    { code: "MAA", city: "Chennai", intl: false, region: "Domestic", purpose: "business" },
    { code: "CCU", city: "Kolkata", intl: false, region: "Domestic", purpose: "family" },
    { code: "GOI", city: "Goa", intl: false, region: "Domestic", purpose: "holiday" },
    { code: "IXC", city: "Chandigarh", intl: false, region: "Domestic", purpose: "family" },
  ];

  const gates = [
    "A1","A2","A3","A4","A5","A6","A7","A8","A9","A10",
    "B1","B2","B3","B4","B5","B6","B7","B8","B9","B10",
    "C1","C2","C3","C4","C5","C6","C7","C8","C9","C10",
    "D1","D2","D3","D4","D5","D6","D7","D8","D9","D10",
    "E1","E2","E3","E4","E5","E6","E7","E8","E9","E10",
    "F1","F2","F3","F4","F5","F6","F7","F8","F9","F10",
  ];

  const flights: CanonicalFlight[] = [];
  const baseDate = new Date("2026-10-24T00:00:00Z");

  let idCounter = 1;

  for (let hour = 5; hour < 24; hour++) {
    const flightsThisHour = hour >= 6 && hour <= 22 ? 45 + Math.floor(Math.random() * 20) : 15;
    for (let i = 0; i < flightsThisHour; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const dest = destinations[Math.floor(Math.random() * destinations.length)];
      const gate = gates[Math.floor(Math.random() * gates.length)];
      const minute = Math.floor(Math.random() * 60);
      const scheduled = new Date(baseDate);
      scheduled.setUTCHours(hour, minute, 0, 0);

      const delay = Math.random() < 0.18 ? Math.floor(Math.random() * 55) + 5 : 0;
      const estimated = new Date(scheduled.getTime() + delay * 60_000);

      const paxBase = dest.intl ? 180 + Math.floor(Math.random() * 140) : 120 + Math.floor(Math.random() * 80);
      const pax = Math.round(paxBase * (0.75 + Math.random() * 0.25));

      let status: CanonicalFlight["status"] = "SCHEDULED";
      if (delay > 0) status = "DELAYED";

      flights.push({
        id: `flt-${String(idCounter++).padStart(4, "0")}`,
        flightNumber: `${airline.code}${100 + Math.floor(Math.random() * 900)}`,
        airlineCode: airline.code,
        origin: "HIA",
        destination: dest.code,
        scheduledDep: scheduled,
        estimatedDep: estimated,
        gate,
        status,
        delayMinutes: delay,
        paxCount: pax,
        aircraftType: dest.intl ? (Math.random() > 0.5 ? "A321neo" : "B737-8") : "A320",
        isInternational: dest.intl,
        isDeparture: true,
        loadFactor: 0.72 + Math.random() * 0.25,
      });
    }
  }

  return flights;
}
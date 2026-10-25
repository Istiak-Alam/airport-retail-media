import type { CanonicalFlight, FlightEvent } from "../types.js";

export interface FlightSource {
  name: string;
  /** Stream of real-time flight events */
  stream(): AsyncIterable<FlightEvent>;
  /** Snapshot of current flights */
  getSnapshot(at: Date): Promise<CanonicalFlight[]>;
  /** Health */
  getHealth(): Promise<{ status: "ok" | "degraded" | "down"; lastMessageAt?: Date; messagesPerMin?: number }>;
}

export interface ZoneSource {
  name: string;
  getZones(): Promise<any[]>;
  getQueueMeasurements(at: Date): Promise<any[]>;
}
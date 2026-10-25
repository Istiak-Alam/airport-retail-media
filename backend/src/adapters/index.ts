import type { FlightSource } from "./types.js";
import { MockAodbAdapter } from "./mockAodb.js";

/**
 * Adapter factory. Switch source with env FLIGHT_SOURCE.
 * Going live = implement one new adapter class and register it here.
 */
export function createFlightSource(): FlightSource {
  const source = process.env.FLIGHT_SOURCE || "mock-aodb";

  switch (source) {
    case "mock-aodb":
    case "mock-aidx":
      return new MockAodbAdapter();
    case "vendor-api":
      // Stub for real vendor – replace with live HTTP/websocket client
      console.warn("vendor-api adapter not implemented – falling back to mock");
      return new MockAodbAdapter();
    default:
      return new MockAodbAdapter();
  }
}

export * from "./types.js";
export * from "./mockAodb.js";
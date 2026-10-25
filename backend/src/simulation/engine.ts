import { EventEmitter } from "events";
import type { CanonicalFlight, SimulationState, AdDecisionResult } from "../types.js";
import { generateSyntheticFlights } from "../adapters/mockAodb.js";
import { buildCrowdProfile } from "../services/presence.js";
import { decideAd, type CampaignCandidate } from "../services/decision.js";

export class SimulationEngine extends EventEmitter {
  private state: SimulationState;
  private flights: CanonicalFlight[] = [];
  private screens: Map<string, any> = new Map();
  private campaigns: CampaignCandidate[] = [];
  private recentPlays: { campaignId: string; screenId: string; at: Date }[] = [];
  private timer: NodeJS.Timeout | null = null;
  private tickMs = 1000; // base 1s wall time

  constructor(startTime: Date) {
    super();
    this.state = {
      currentTime: new Date(startTime),
      speed: 1,
      isPlaying: false,
      startedAt: new Date(),
    };
    this.flights = generateSyntheticFlights();
  }

  getState() {
    return { ...this.state };
  }

  getFlights() {
    return this.flights;
  }

  setCampaigns(campaigns: CampaignCandidate[]) {
    this.campaigns = campaigns;
  }

  setScreens(screens: any[]) {
    this.screens.clear();
    for (const s of screens) {
      this.screens.set(s.id, {
        ...s,
        currentCampaignId: null,
        lastDecision: null,
      });
    }
  }

  play() {
    this.state.isPlaying = true;
    this.scheduleTick();
    this.emit("state", this.getState());
  }

  pause() {
    this.state.isPlaying = false;
    if (this.timer) clearTimeout(this.timer);
    this.emit("state", this.getState());
  }

  setSpeed(speed: 1 | 10 | 60) {
    this.state.speed = speed;
    this.emit("state", this.getState());
  }

  jumpTo(time: Date) {
    this.state.currentTime = new Date(time);
    this.runDecisions();
    this.emit("state", this.getState());
    this.emit("time", this.state.currentTime);
  }

  /** Inject a live event (WOW feature) */
  injectEvent(type: "DELAY" | "GATE_CHANGE" | "SCREEN_OFFLINE", payload: any) {
    const at = this.state.currentTime;

    if (type === "DELAY") {
      const flight = this.flights.find((f) => f.id === payload.flightId || f.flightNumber === payload.flightNumber);
      if (flight) {
        const extra = payload.delayMinutes ?? 30;
        flight.delayMinutes += extra;
        flight.status = "DELAYED";
        flight.estimatedDep = new Date(
          (flight.estimatedDep ?? flight.scheduledDep).getTime() + extra * 60_000
        );
        this.emit("flightEvent", {
          type: "DELAY",
          flight,
          extraDelay: extra,
          at,
        });
      }
    } else if (type === "GATE_CHANGE") {
      const flight = this.flights.find((f) => f.id === payload.flightId);
      if (flight) {
        const oldGate = flight.gate;
        flight.gate = payload.newGate;
        this.emit("flightEvent", {
          type: "GATE_CHANGE",
          flight,
          oldGate,
          newGate: payload.newGate,
          at,
        });
      }
    } else if (type === "SCREEN_OFFLINE") {
      const screen = this.screens.get(payload.screenId);
      if (screen) {
        screen.status = "OFFLINE";
        this.emit("screenEvent", { type: "OFFLINE", screen, at });
      }
    }

    // Immediately re-run decisions so cause-and-effect is visible
    this.runDecisions();
  }

  private scheduleTick() {
    if (!this.state.isPlaying) return;
    if (this.timer) clearTimeout(this.timer);

    const wallMs = this.tickMs;
    this.timer = setTimeout(() => {
      // Advance simulation time
      const advanceMs = wallMs * this.state.speed;
      this.state.currentTime = new Date(this.state.currentTime.getTime() + advanceMs);

      this.runDecisions();
      this.emit("time", this.state.currentTime);
      this.emit("state", this.getState());

      this.scheduleTick();
    }, wallMs);
  }

  private runDecisions() {
    const at = this.state.currentTime;
    const decisions: AdDecisionResult[] = [];

    for (const [screenId, screen] of this.screens) {
      if (screen.status === "OFFLINE") continue;

      const crowd = buildCrowdProfile(
        this.flights,
        at,
        screen.nearestGates || [],
        15
      );

      const decision = decideAd(
        screenId,
        screen.zoneId,
        screen.nearestGates || [],
        crowd,
        this.campaigns,
        at,
        this.recentPlays
      );

      screen.lastDecision = decision;
      screen.currentCampaignId = decision.winnerCampaignId;

      if (decision.winnerCampaignId) {
        this.recentPlays.push({
          campaignId: decision.winnerCampaignId,
          screenId,
          at,
        });
        // keep recent window small
        if (this.recentPlays.length > 5000) {
          this.recentPlays = this.recentPlays.slice(-2000);
        }
      }

      decisions.push(decision);
    }

    this.emit("decisions", decisions);
  }

  /** Force a decision cycle (useful after inject) */
  forceTick() {
    this.runDecisions();
  }
}
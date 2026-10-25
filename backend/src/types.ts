// Canonical internal model types

export type FlightStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "FINAL_CALL"
  | "DEPARTED"
  | "DELAYED"
  | "CANCELLED"
  | "DIVERTED"
  | "ARRIVED";

export interface CanonicalFlight {
  id: string;
  flightNumber: string;
  airlineCode: string;
  origin: string;
  destination: string;
  via?: string;
  scheduledDep: Date;
  estimatedDep?: Date;
  actualDep?: Date;
  gate?: string;
  stand?: string;
  status: FlightStatus;
  delayMinutes: number;
  paxCount: number;
  aircraftType?: string;
  isInternational: boolean;
  isDeparture: boolean;
  loadFactor: number;
}

export interface FlightEvent {
  id: string;
  flightId: string;
  type: "DELAY" | "GATE_CHANGE" | "STATUS_CHANGE" | "BOARDING_START" | "DEPARTURE";
  payload: Record<string, unknown>;
  source: "AODB" | "AIDX";
  timestamp: Date;
}

export interface CrowdProfile {
  paxEstimate: number;
  internationalShare: number;
  domesticShare: number;
  holidayShare: number;
  businessShare: number;
  familyShare: number;
  coupleShare: number;
  soloShare: number;
  ageBands: Record<string, number>; // under12, 12-17, 18-24, ...
  genderFemaleShare: number;
  topDestinations: { code: string; share: number }[];
  topNationalities: { code: string; share: number }[];
  medianDwellMinutes: number;
  delayBoost: number; // 0-1 extra from delays
  sourceFlights: string[];
  confidence: number;
}

export interface SegmentWeights {
  family?: number;
  holiday?: number;
  business?: number;
  international?: number;
  domestic?: number;
  couple?: number;
  solo?: number;
  premium?: number;
  [key: string]: number | undefined;
}

export interface HardFilters {
  internationalOnly?: boolean;
  domesticOnly?: boolean;
  destinations?: string[];
  regions?: string[];
  minDwellMinutes?: number;
  minCrowdSize?: number;
  maxCrowdSize?: number;
  ageBands?: string[];
}

export interface ScoredCampaign {
  campaignId: string;
  name: string;
  score: number;
  audienceMatch: number;
  boost: number;
  reasons: string[];
  filtered?: boolean;
  filterReason?: string;
}

export interface AdDecisionResult {
  screenId: string;
  timestamp: Date;
  crowdProfile: CrowdProfile;
  candidates: ScoredCampaign[];
  winnerCampaignId: string | null;
  winnerScore: number | null;
  reason: string;
  evidence: {
    inputs: { source: string; timestamp: Date; freshnessSec: number }[];
    hardRulesPassed: string[];
    hardRulesFailed: string[];
    scoreBreakdown: Record<string, number>;
  };
  rejectedAi: boolean;
}

export interface SimulationState {
  currentTime: Date;
  speed: 1 | 10 | 60;
  isPlaying: boolean;
  startedAt: Date;
}

export interface ScreenState {
  id: string;
  code: string;
  status: "ONLINE" | "DEGRADED" | "OFFLINE";
  currentCampaignId: string | null;
  currentCreative: any;
  lastDecision: AdDecisionResult | null;
  nearestGates: string[];
  zoneId: string;
}
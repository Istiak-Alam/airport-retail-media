import type {
  CrowdProfile,
  HardFilters,
  SegmentWeights,
  ScoredCampaign,
  AdDecisionResult,
} from "../types.js";

export interface CampaignCandidate {
  id: string;
  name: string;
  status: string;
  hardFilters: HardFilters;
  segmentWeights: SegmentWeights;
  placementZones: string[];
  placementScreens: string[];
  budgetCents: number;
  spentCents: number;
  dailyCapCents?: number;
  frequencyCap: number;
  triggers?: any;
  airlineCode?: string | null;
}

/**
 * Evidence-first decision pipeline.
 * Deterministic checks first → score → business rules → choose + log.
 */
export function decideAd(
  screenId: string,
  zoneId: string,
  nearestGates: string[],
  crowd: CrowdProfile,
  candidates: CampaignCandidate[],
  at: Date,
  recentPlays: { campaignId: string; screenId: string; at: Date }[] = []
): AdDecisionResult {
  const evidence = {
    inputs: [
      { source: "ZonePresence", timestamp: at, freshnessSec: 0 },
      { source: "AODB/AIDX", timestamp: at, freshnessSec: 15 },
    ],
    hardRulesPassed: [] as string[],
    hardRulesFailed: [] as string[],
    scoreBreakdown: {} as Record<string, number>,
  };

  const scored: ScoredCampaign[] = [];

  for (const c of candidates) {
    // 1. Hard filters
    const filterResult = applyHardFilters(c, crowd, zoneId, screenId, at);
    if (!filterResult.ok) {
      scored.push({
        campaignId: c.id,
        name: c.name,
        score: 0,
        audienceMatch: 0,
        boost: 1,
        reasons: [],
        filtered: true,
        filterReason: filterResult.reason,
      });
      evidence.hardRulesFailed.push(`${c.name}: ${filterResult.reason}`);
      continue;
    }
    evidence.hardRulesPassed.push(c.name);

    // 2. Audience match score
    const match = computeAudienceMatch(c.segmentWeights, crowd);

    // 3. Boosts (delay, etc.)
    let boost = 1.0;
    const reasons: string[] = [`audience match ${(match * 100).toFixed(0)}%`];

    if (c.triggers?.delayMinutes && crowd.delayBoost > 0.2) {
      boost *= 1.5;
      reasons.push("delay boost ×1.5");
    }
    if (c.airlineCode && nearestGates.some((g) => true)) {
      // simplified airline priority near its gates
      boost *= 1.2;
      reasons.push("airline gate priority");
    }

    // Frequency cap
    const recentOnScreen = recentPlays.filter(
      (p) => p.campaignId === c.id && p.screenId === screenId && at.getTime() - p.at.getTime() < 60 * 60_000
    ).length;
    if (recentOnScreen >= c.frequencyCap) {
      scored.push({
        campaignId: c.id,
        name: c.name,
        score: 0,
        audienceMatch: match,
        boost,
        reasons,
        filtered: true,
        filterReason: "frequency cap reached",
      });
      continue;
    }

    // Budget
    if (c.spentCents >= c.budgetCents) {
      scored.push({
        campaignId: c.id,
        name: c.name,
        score: 0,
        audienceMatch: match,
        boost,
        reasons,
        filtered: true,
        filterReason: "budget exhausted",
      });
      continue;
    }

    const finalScore = Math.min(1, match * boost);
    evidence.scoreBreakdown[c.id] = finalScore;

    scored.push({
      campaignId: c.id,
      name: c.name,
      score: finalScore,
      audienceMatch: match,
      boost,
      reasons,
    });
  }

  // Sort by score desc
  scored.sort((a, b) => b.score - a.score);

  const winner = scored.find((s) => !s.filtered && s.score > 0.05) || null;

  return {
    screenId,
    timestamp: at,
    crowdProfile: crowd,
    candidates: scored,
    winnerCampaignId: winner?.campaignId ?? null,
    winnerScore: winner?.score ?? null,
    reason: winner
      ? `Highest score ${(winner.score * 100).toFixed(0)}% — ${winner.reasons.join(", ")}`
      : "No eligible campaign — fallback default",
    evidence,
    rejectedAi: false,
  };
}

function applyHardFilters(
  c: CampaignCandidate,
  crowd: CrowdProfile,
  zoneId: string,
  screenId: string,
  at: Date
): { ok: boolean; reason?: string } {
  const f = c.hardFilters || {};

  if (c.status !== "ACTIVE" && c.status !== "APPROVED") {
    return { ok: false, reason: "not active" };
  }

  if (f.internationalOnly && crowd.internationalShare < 0.4) {
    return { ok: false, reason: "requires international crowd" };
  }
  if (f.domesticOnly && crowd.domesticShare < 0.5) {
    return { ok: false, reason: "requires domestic crowd" };
  }
  if (f.minDwellMinutes && crowd.medianDwellMinutes < f.minDwellMinutes) {
    return { ok: false, reason: `dwell ${crowd.medianDwellMinutes}m < ${f.minDwellMinutes}m` };
  }
  if (f.minCrowdSize && crowd.paxEstimate < f.minCrowdSize) {
    return { ok: false, reason: `crowd ${crowd.paxEstimate} < ${f.minCrowdSize}` };
  }
  if (c.placementZones?.length && !c.placementZones.includes(zoneId) && !c.placementScreens?.includes(screenId)) {
    // allow if no placement restriction
    if (c.placementZones.length > 0 || c.placementScreens.length > 0) {
      return { ok: false, reason: "placement mismatch" };
    }
  }

  return { ok: true };
}

function computeAudienceMatch(weights: SegmentWeights, crowd: CrowdProfile): number {
  if (!weights || Object.keys(weights).length === 0) return 0.4;

  let score = 0;
  let totalWeight = 0;

  const mapping: Record<string, number> = {
    family: crowd.familyShare,
    holiday: crowd.holidayShare,
    business: crowd.businessShare,
    international: crowd.internationalShare,
    domestic: crowd.domesticShare,
    couple: crowd.coupleShare,
    solo: crowd.soloShare,
    premium: crowd.businessShare * 0.6, // rough proxy
  };

  for (const [key, w] of Object.entries(weights)) {
    if (w === undefined || w <= 0) continue;
    const share = mapping[key] ?? 0;
    score += share * w;
    totalWeight += w;
  }

  if (totalWeight === 0) return 0.4;
  return Math.min(1, score / totalWeight);
}
import type { CanonicalFlight, CrowdProfile } from "../types.js";

/**
 * Builds ZonePresence / CrowdProfile estimates.
 * Core value of the platform: who is in front of each screen and for how long.
 */
export function buildCrowdProfile(
  flights: CanonicalFlight[],
  at: Date,
  nearestGates: string[],
  windowMinutes = 15
): CrowdProfile {
  const windowEnd = new Date(at.getTime() + windowMinutes * 60_000);

  // Flights that will have passengers near these gates in the window
  const relevant = flights.filter((f) => {
    if (!f.gate || !nearestGates.includes(f.gate)) return false;
    const dep = f.estimatedDep ?? f.scheduledDep;
    // Passengers arrive ~90–30 min before departure
    const presenceStart = new Date(dep.getTime() - 90 * 60_000);
    const presenceEnd = new Date(dep.getTime() - 10 * 60_000); // leave for boarding
    return presenceStart < windowEnd && presenceEnd > at;
  });

  if (relevant.length === 0) {
    return emptyProfile();
  }

  let totalPax = 0;
  let intlPax = 0;
  let holiday = 0;
  let business = 0;
  let family = 0;
  let couple = 0;
  let solo = 0;
  let delayWeighted = 0;
  const destCounts: Record<string, number> = {};
  const dwells: number[] = [];

  for (const f of relevant) {
    const weight = f.paxCount;
    totalPax += weight;
    if (f.isInternational) intlPax += weight;

    // Plausible purpose heuristics
    const hour = (f.estimatedDep ?? f.scheduledDep).getUTCHours();
    const isWeekend = [0, 6].includes((f.estimatedDep ?? f.scheduledDep).getUTCDay());
    const isLeisureRoute = ["DXB", "BKK", "GOI", "SYD", "CDG", "NRT"].includes(f.destination);
    const isBusinessRoute = ["LHR", "JFK", "SIN", "BOM", "DEL", "BLR"].includes(f.destination);

    let h = 0.25, b = 0.25, fam = 0.2, coup = 0.15, s = 0.15;
    if (isLeisureRoute || isWeekend || hour >= 18) {
      h = 0.45; fam = 0.3; coup = 0.15; b = 0.05; s = 0.05;
    } else if (isBusinessRoute && hour < 10) {
      b = 0.55; s = 0.25; h = 0.1; fam = 0.05; coup = 0.05;
    }

    holiday += weight * h;
    business += weight * b;
    family += weight * fam;
    couple += weight * coup;
    solo += weight * s;

    destCounts[f.destination] = (destCounts[f.destination] || 0) + weight;

    const dep = f.estimatedDep ?? f.scheduledDep;
    const dwell = Math.max(15, Math.min(90, (dep.getTime() - at.getTime()) / 60_000));
    dwells.push(dwell);

    if (f.delayMinutes > 15) {
      delayWeighted += weight * Math.min(1, f.delayMinutes / 60);
    }
  }

  const topDestinations = Object.entries(destCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, c]) => ({ code, share: c / totalPax }));

  const medianDwell = dwells.sort((a, b) => a - b)[Math.floor(dwells.length / 2)] || 40;

  return {
    paxEstimate: Math.round(totalPax * 0.65), // not everyone is still in the zone
    internationalShare: totalPax ? intlPax / totalPax : 0,
    domesticShare: totalPax ? 1 - intlPax / totalPax : 0,
    holidayShare: totalPax ? holiday / totalPax : 0,
    businessShare: totalPax ? business / totalPax : 0,
    familyShare: totalPax ? family / totalPax : 0,
    coupleShare: totalPax ? couple / totalPax : 0,
    soloShare: totalPax ? solo / totalPax : 0,
    ageBands: {
      "under12": 0.08,
      "12-17": 0.06,
      "18-24": 0.14,
      "25-34": 0.28,
      "35-44": 0.22,
      "45-54": 0.12,
      "55+": 0.10,
    },
    genderFemaleShare: 0.48,
    topDestinations,
    topNationalities: [
      { code: "IN", share: 0.42 },
      { code: "AE", share: 0.12 },
      { code: "GB", share: 0.09 },
      { code: "US", share: 0.07 },
      { code: "SG", share: 0.05 },
    ],
    medianDwellMinutes: Math.round(medianDwell),
    delayBoost: totalPax ? Math.min(1, delayWeighted / totalPax) : 0,
    sourceFlights: relevant.map((f) => f.id),
    confidence: Math.min(0.95, 0.5 + relevant.length * 0.08),
  };
}

function emptyProfile(): CrowdProfile {
  return {
    paxEstimate: 20,
    internationalShare: 0.3,
    domesticShare: 0.7,
    holidayShare: 0.25,
    businessShare: 0.3,
    familyShare: 0.15,
    coupleShare: 0.15,
    soloShare: 0.15,
    ageBands: {},
    genderFemaleShare: 0.5,
    topDestinations: [],
    topNationalities: [],
    medianDwellMinutes: 25,
    delayBoost: 0,
    sourceFlights: [],
    confidence: 0.3,
  };
}
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  health: () => get("/health"),
  simState: () => get<any>("/api/sim/state"),
  play: () => post("/api/sim/play"),
  pause: () => post("/api/sim/pause"),
  setSpeed: (speed: 1 | 10 | 60) => post("/api/sim/speed", { speed }),
  jump: (time: string) => post("/api/sim/jump", { time }),
  inject: (type: string, payload: any) => post("/api/sim/inject", { type, payload }),
  flights: () => get<any[]>("/api/flights"),
  screens: () => get<any[]>("/api/screens"),
  campaigns: () => get<any[]>("/api/campaigns"),
  kpis: () => get<any>("/api/kpis"),
  incidents: () => get<any[]>("/api/incidents"),
  presence: (gates?: string) => get<any>(`/api/presence${gates ? `?gates=${gates}` : ""}`),
  retailerMetrics: () => get<any>("/api/retailer/metrics"),
  airlines: () => get<any[]>("/api/airlines"),
  outlets: () => get<any[]>("/api/outlets"),
  redeem: (code: string, campaignId?: string) => post("/api/redeem", { code, campaignId }),
};
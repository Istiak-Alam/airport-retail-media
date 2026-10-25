import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Activity, Monitor, DollarSign, AlertTriangle, Radio } from "lucide-react";

export function AdminDashboard({ sim }: { sim: any }) {
  const [kpis, setKpis] = useState<any>(null);
  const [screens, setScreens] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    const load = () => {
      api.kpis().then(setKpis).catch(() => {});
      api.screens().then(setScreens).catch(() => {});
      api.incidents().then(setIncidents).catch(() => {});
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard
          icon={<Monitor className="w-4 h-4" />}
          label="Screens Online"
          value={`${kpis?.screensOnlinePct ?? "—"}%`}
          sub={`${kpis?.screensTotal ?? 0} total`}
        />
        <KpiCard
          icon={<Activity className="w-4 h-4" />}
          label="Ad Plays Today"
          value={kpis?.adPlaysToday?.toLocaleString() ?? "—"}
        />
        <KpiCard
          icon={<Activity className="w-4 h-4" />}
          label="Impressions"
          value={kpis?.impressions?.toLocaleString() ?? "—"}
        />
        <KpiCard
          icon={<DollarSign className="w-4 h-4" />}
          label="Revenue Today"
          value={`$${((kpis?.revenueTodayCents ?? 0) / 100).toLocaleString()}`}
        />
        <KpiCard
          icon={<Radio className="w-4 h-4" />}
          label="Active Campaigns"
          value={kpis?.activeCampaigns ?? "—"}
        />
        <KpiCard
          icon={<Activity className="w-4 h-4" />}
          label="Avg Latency"
          value={`${kpis?.avgLatencyMs ?? "—"} ms`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal map */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-700 p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">
            Live Network Map · Passenger Presence Heat
          </h2>
          <div className="relative h-80 bg-slate-950 rounded-lg overflow-hidden">
            {/* Stylised SVG floor plan */}
            <svg viewBox="0 0 800 400" className="w-full h-full">
              {/* T1 */}
              <rect x="20" y="40" width="280" height="320" rx="8" fill="#1e293b" stroke="#334155" />
              <text x="160" y="30" textAnchor="middle" fill="#94a3b8" fontSize="12">
                Terminal 1 – Domestic
              </text>
              {/* T2 */}
              <rect x="340" y="40" width="440" height="320" rx="8" fill="#1e293b" stroke="#334155" />
              <text x="560" y="30" textAnchor="middle" fill="#94a3b8" fontSize="12">
                Terminal 2 – International
              </text>

              {/* Screens as dots */}
              {screens.slice(0, 120).map((s, i) => {
                const isT2 = s.terminal?.code === "T2" || s.code?.includes("T2");
                const x = isT2
                  ? 360 + (i % 20) * 20
                  : 40 + (i % 12) * 20;
                const y = 60 + Math.floor((i % 60) / (isT2 ? 20 : 12)) * 28;
                const color =
                  s.status === "ONLINE"
                    ? "#22c55e"
                    : s.status === "DEGRADED"
                    ? "#eab308"
                    : "#ef4444";
                return (
                  <circle
                    key={s.id || i}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={color}
                    opacity={0.9}
                  >
                    <title>{s.code} · {s.status}</title>
                  </circle>
                );
              })}

              {/* Heat blobs (simplified) */}
              <ellipse cx="480" cy="180" rx="90" ry="50" fill="#f97316" opacity="0.15" />
              <ellipse cx="620" cy="220" rx="70" ry="40" fill="#ef4444" opacity="0.12" />
              <ellipse cx="160" cy="200" rx="60" ry="35" fill="#eab308" opacity="0.12" />
            </svg>
            <div className="absolute bottom-2 left-2 flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" /> Degraded
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Offline
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 rounded bg-orange-500/40" /> High presence
              </span>
            </div>
          </div>
        </div>

        {/* Incidents */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Incidents & Alerts
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {incidents.length === 0 && (
              <p className="text-sm text-slate-500">No open incidents</p>
            )}
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-lg bg-slate-800/80 border border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      inc.severity === "HIGH" || inc.severity === "CRITICAL"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {inc.severity}
                  </span>
                  <span className="text-xs text-slate-500">{inc.status}</span>
                </div>
                <p className="text-sm mt-1 text-slate-200">{inc.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feed health */}
      <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">Data Feed Health</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <FeedCard name="AODB Snapshot" status="ok" msg="12 msg/min · last 3s ago" adapter="mock-aodb" />
          <FeedCard name="AIDX Stream" status="ok" msg="8 msg/min · last 1s ago" adapter="mock-aidx" />
          <FeedCard name="ACRIS Zones" status="ok" msg="Entities fresh" adapter="mock-acris" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function FeedCard({
  name,
  status,
  msg,
  adapter,
}: {
  name: string;
  status: string;
  msg: string;
  adapter: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-200">{name}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
      </div>
      <p className="text-xs text-slate-400 mt-1">{msg}</p>
      <p className="text-xs text-slate-500 mt-0.5">Adapter: {adapter}</p>
    </div>
  );
}
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { GenAICreative } from "../components/GenAICreative";

export function RetailerDashboard({ sim }: { sim: any }) {
  const [metrics, setMetrics] = useState<any>(null);
  const [presence, setPresence] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [outlet, setOutlet] = useState("Lumina Duty Free – T2 Plaza");
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    const load = () => {
      api.retailerMetrics().then(setMetrics).catch(() => {});
      api.presence("C5,D5,E5").then(setPresence).catch(() => {});
      api.campaigns().then(setCampaigns).catch(() => {});
    };
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, []);

  const profile = presence?.profile;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Retailer Dashboard</h1>
          <p className="text-sm text-slate-500">Selected outlet</p>
        </div>
        <select
          value={outlet}
          onChange={(e) => setOutlet(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option>Lumina Duty Free – T2 Plaza</option>
          <option>AromaBean – Gate C</option>
          <option>TinyTravellers – T1</option>
          <option>VelvetScents – T2</option>
        </select>
      </div>

      {/* Live metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Metric label="Impressions" value={metrics?.impressions?.toLocaleString() ?? "—"} />
        <Metric label="Scans" value={metrics?.scans?.toLocaleString() ?? "—"} />
        <Metric label="Redemptions" value={metrics?.redemptions?.toLocaleString() ?? "—"} live />
        <Metric
          label="Conversion"
          value={
            metrics?.conversionRate != null
              ? `${(metrics.conversionRate * 100).toFixed(1)}%`
              : "—"
          }
        />
        <Metric
          label="Attributed Revenue"
          value={`$${((metrics?.revenueAttributedCents ?? 0) / 100).toLocaleString()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Passenger flow */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-3">Passenger Flow Near My Store</h2>
          {profile ? (
            <div className="space-y-3">
              <div className="text-3xl font-bold text-sky-600">
                {profile.paxEstimate?.toLocaleString()} pax
              </div>
              <p className="text-sm text-slate-500">Next 30–60 min estimate</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-slate-50 rounded p-2">
                  International{" "}
                  <span className="font-medium">
                    {((profile.internationalShare || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  Holiday{" "}
                  <span className="font-medium">
                    {((profile.holidayShare || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  Family{" "}
                  <span className="font-medium">
                    {((profile.familyShare || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="bg-slate-50 rounded p-2">
                  Median dwell{" "}
                  <span className="font-medium">{profile.medianDwellMinutes} min</span>
                </div>
              </div>
              {profile.topDestinations?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Top destinations</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.topDestinations.map((d: any) => (
                      <span
                        key={d.code}
                        className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded"
                      >
                        {d.code} {(d.share * 100).toFixed(0)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Audience match preview */}
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm">
                <strong>Live match preview:</strong> A campaign targeting International + Holiday
                currently matches{" "}
                <span className="font-semibold text-emerald-700">
                  {Math.round(
                    ((profile.internationalShare || 0) * 0.6 + (profile.holidayShare || 0) * 0.4) *
                      100
                  )}
                  %
                </span>{" "}
                of the crowd at this zone.
              </div>
            </div>
          ) : (
            <p className="text-slate-400">Loading presence…</p>
          )}
        </div>

        {/* Campaigns */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">Campaigns</h2>
            <button
              onClick={() => setShowBuilder((v) => !v)}
              className="text-xs px-3 py-1.5 rounded-lg bg-sky-600 text-white font-medium"
            >
              {showBuilder ? "Close builder" : "+ New Campaign"}
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {campaigns.slice(0, 8).map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.status} · Budget ${(c.budgetCents / 100).toLocaleString()}
                  </p>
                </div>
                <button className="text-xs text-sky-600 font-medium">Run again</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Campaign builder + GenAI */}
      {showBuilder && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-3">
            <h2 className="font-semibold">Campaign Builder</h2>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Campaign name"
              defaultValue="New seasonal promo"
            />
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> International only
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Domestic only
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked /> Holiday travellers
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" /> Families
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Min dwell (min)</label>
                <input type="number" defaultValue={15} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
              <div>
                <label className="text-xs text-slate-500">Budget ($)</label>
                <input type="number" defaultValue={2000} className="w-full border rounded px-2 py-1 text-sm" />
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border text-sm">
              <p className="font-medium mb-1">Mock screen preview</p>
              <div className="bg-slate-800 text-white rounded p-4 text-center">
                <p className="text-xs text-sky-300">Your Brand</p>
                <p className="font-semibold mt-1">Special Offer</p>
                <p className="text-xs text-slate-400 mt-2">Scan QR to claim</p>
              </div>
            </div>
            <button className="w-full py-2 rounded-lg bg-sky-600 text-white text-sm font-medium">
              Save & submit for approval
            </button>
          </div>
          <GenAICreative />
        </div>
      )}

      {/* Promo codes note */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-800">
        <strong>Promo codes</strong> are time-boxed to the crowd in front of the screen. Scan the QR
        on the Passenger Screen (or open{" "}
        <code className="bg-violet-100 px-1 rounded">/claim?code=HIADEMO</code>) — redemption
        appears here in real time.
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  live,
}: {
  label: string;
  value: string | number;
  live?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="text-xs text-slate-500 flex items-center gap-1">
        {label}
        {live && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      </div>
      <div className="text-xl font-semibold text-slate-900 mt-1">{value}</div>
    </div>
  );
}

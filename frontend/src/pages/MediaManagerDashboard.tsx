import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function MediaManagerDashboard({ sim }: { sim: any }) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [screens, setScreens] = useState<any[]>([]);

  useEffect(() => {
    api.campaigns().then(setCampaigns).catch(() => {});
    api.screens().then(setScreens).catch(() => {});
  }, []);

  const pending = campaigns.filter((c) => c.status === "PENDING_APPROVAL" || c.status === "DRAFT");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-900">Media Manager · Inventory & Yield</h1>

      {/* Yield summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Screens" value={screens.length} />
        <Card title="Occupancy (next 7d)" value="68%" />
        <Card title="Revenue Forecast" value="$42,800" />
        <Card title="Premium Slots Available" value="124" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory calendar (simplified) */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-3">Inventory Calendar · Screen × Hour</h2>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-1 text-xs min-w-[500px]">
              <div className="font-medium text-slate-500">Screen</div>
              {["13", "14", "15", "16", "17", "18", "19"].map((h) => (
                <div key={h} className="text-center font-medium text-slate-500">
                  {h}:00
                </div>
              ))}
              {screens.slice(0, 10).map((s) => (
                <>
                  <div key={s.id + "l"} className="truncate text-slate-700 py-1">
                    {s.code?.slice(-8)}
                  </div>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                    const booked = Math.random() > 0.35;
                    const premium = Math.random() > 0.7;
                    return (
                      <div
                        key={s.id + i}
                        className={`h-7 rounded ${
                          booked
                            ? premium
                              ? "bg-violet-400"
                              : "bg-sky-400"
                            : "bg-slate-100 border border-dashed border-slate-300"
                        }`}
                        title={booked ? (premium ? "Premium booked" : "Booked") : "Available"}
                      />
                    );
                  })}
                </>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-sky-400" /> Booked
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-violet-400" /> Premium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-100 border border-dashed" /> Available
            </span>
          </div>
        </div>

        {/* Approval queue */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-3">Approval Queue</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500">No campaigns awaiting review</p>
          ) : (
            <div className="space-y-2">
              {pending.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border bg-slate-50 flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 rounded bg-emerald-600 text-white">
                      Approve
                    </button>
                    <button className="text-xs px-2 py-1 rounded bg-slate-200">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Advertiser overview */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold mb-3">Advertiser Overview</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Advertiser</th>
              <th className="pb-2">Campaigns</th>
              <th className="pb-2">Spend</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {["Lumina Duty Free", "AromaBean Coffee", "TinyTravellers", "VelvetScents", "Horizon Lounge"].map(
              (name, i) => (
                <tr key={name} className="border-b border-slate-100">
                  <td className="py-2">{name}</td>
                  <td>{2 + i}</td>
                  <td>${(12000 + i * 3400).toLocaleString()}</td>
                  <td>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      On track
                    </span>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { format } from "date-fns";

export function AirlineDashboard({ sim }: { sim: any }) {
  const [flights, setFlights] = useState<any[]>([]);
  const [airline, setAirline] = useState("XY");

  useEffect(() => {
    const load = () => {
      api.flights().then((all) => {
        setFlights(all.filter((f: any) => f.airlineCode === airline));
      }).catch(() => {});
    };
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [airline]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Airline Representative</h1>
        <select
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="XY">SkyNova Airways (XY)</option>
          <option value="ZQ">JetBloom (ZQ)</option>
          <option value="HK">Horizon Air (HK)</option>
          <option value="OP">OceanPearl (OP)</option>
        </select>
      </div>

      {/* My flights today */}
      <div className="bg-white rounded-xl border shadow-sm p-5">
        <h2 className="font-semibold mb-3">My Flights Today</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="pb-2">Flight</th>
                <th className="pb-2">Destination</th>
                <th className="pb-2">Gate</th>
                <th className="pb-2">Sched</th>
                <th className="pb-2">Est</th>
                <th className="pb-2">Delay</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Pax</th>
              </tr>
            </thead>
            <tbody>
              {flights.slice(0, 15).map((f) => (
                <tr key={f.id} className="border-b border-slate-100">
                  <td className="py-2 font-medium">{f.flightNumber}</td>
                  <td>{f.destination}</td>
                  <td>{f.gate || "—"}</td>
                  <td>{format(new Date(f.scheduledDep), "HH:mm")}</td>
                  <td>
                    {f.estimatedDep
                      ? format(new Date(f.estimatedDep), "HH:mm")
                      : "—"}
                  </td>
                  <td>
                    {f.delayMinutes > 0 ? (
                      <span className="text-amber-600 font-medium">+{f.delayMinutes}m</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <StatusBadge status={f.status} />
                  </td>
                  <td>{f.paxCount}</td>
                </tr>
              ))}
              {flights.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    No flights in current simulation window for this airline
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gate messaging */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-3">Gate-Area Messaging</h2>
          <p className="text-sm text-slate-500 mb-3">
            Schedule sponsored content on screens at your gates during boarding windows.
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
              <p className="text-sm font-medium">Upgrade to Business – 30% off</p>
              <p className="text-xs text-slate-500">Gates C3–C6 · Boarding window</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border">
              <p className="text-sm font-medium">Lounge day pass for delayed pax</p>
              <p className="text-xs text-slate-500">Auto-triggered when delay &gt; 40 min</p>
            </div>
          </div>
          <button className="mt-3 text-sm text-sky-600 font-medium">+ Schedule message</button>
        </div>

        {/* Delay goodwill */}
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <h2 className="font-semibold mb-3">Delay Goodwill Automation</h2>
          <p className="text-sm text-slate-500 mb-3">
            When a flight is delayed past threshold, auto-push co-funded meal / lounge voucher to
            gate screens.
          </p>
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
            <p className="text-sm font-medium text-amber-800">
              Active rule: delay ≥ 30 min → AromaBean free upgrade + Horizon Lounge 50% off
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Co-funded with F&B partners. Inject a delay on the control bar to see it fire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    SCHEDULED: "bg-slate-100 text-slate-600",
    BOARDING: "bg-sky-100 text-sky-700",
    DELAYED: "bg-amber-100 text-amber-700",
    DEPARTED: "bg-slate-200 text-slate-500",
    FINAL_CALL: "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded ${colors[status] || "bg-slate-100"}`}>
      {status}
    </span>
  );
}
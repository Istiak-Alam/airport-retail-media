import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { format } from "date-fns";

export function PassengerScreen({
  sim,
  compact,
}: {
  sim: any;
  compact?: boolean;
}) {
  const [flights, setFlights] = useState<any[]>([]);
  const [decision, setDecision] = useState<any>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [selectedGate, setSelectedGate] = useState("C5");

  useEffect(() => {
    const load = () => {
      api.flights().then(setFlights).catch(() => {});
      // In full version we would fetch the live decision for a specific screen
    };
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  // Mock current ad based on presence of delays
  const hasDelay = flights.some((f) => f.delayMinutes > 20 && f.gate?.startsWith("C"));
  const ad = hasDelay
    ? {
        headline: "Delayed? Enjoy 15% off at Lumina Duty Free",
        body: "Show this screen or scan QR. Valid until boarding closes.",
        cta: "Scan to claim",
        brand: "Lumina Duty Free",
        score: 0.86,
      }
    : {
        headline: "Buy 2 Get 1 Free – TinyTravellers Toys",
        body: "Perfect for the little travellers. Family favourite.",
        cta: "Scan to claim",
        brand: "TinyTravellers",
        score: 0.52,
      };

  const nearby = flights
    .filter((f) => f.gate && ["C3", "C4", "C5", "C6", "C7"].includes(f.gate))
    .slice(0, 4);

  const claimUrl = `http://${window.location.hostname}:3000/claim?code=HIADEMO&gate=${selectedGate}`;

  return (
    <div className={`${compact ? "h-full" : "min-h-[calc(100vh-110px)]"} bg-slate-900 text-white flex flex-col`}>
      {/* Screen frame */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>Screen · Gate {selectedGate} · Zone T2-GATES-C</span>
          <select
            value={selectedGate}
            onChange={(e) => setSelectedGate(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-xs"
          >
            {["C3", "C4", "C5", "C6", "D5", "E5"].map((g) => (
              <option key={g} value={g}>
                Gate {g}
              </option>
            ))}
          </select>
        </div>

        {/* Ad area */}
        <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowWhy((v) => !v)}
              className="text-xs bg-slate-700/80 hover:bg-slate-600 px-3 py-1.5 rounded-full"
            >
              Why this ad?
            </button>
          </div>

          <p className="text-sm text-sky-400 font-medium mb-2">{ad.brand}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center leading-tight max-w-lg">
            {ad.headline}
          </h2>
          <p className="mt-4 text-slate-300 text-center max-w-md">{ad.body}</p>

          {/* QR + countdown */}
          <div className="mt-8 flex items-center gap-6">
            <a
              href={`/claim?code=HIADEMO&gate=${selectedGate}`}
              target="_blank"
              rel="noreferrer"
              className="w-28 h-28 bg-white rounded-xl flex items-center justify-center hover:ring-2 hover:ring-sky-400 transition"
              title="Open claim page (simulates QR scan)"
            >
              <div className="text-[10px] text-slate-800 text-center p-2 leading-tight">
                QR<br />SCAN<br />CLAIM
              </div>
            </a>
            <div>
              <p className="text-sm text-slate-400">Promo code</p>
              <p className="text-2xl font-mono font-bold tracking-wider">HIADEMO</p>
              <p className="text-xs text-amber-400 mt-1">Expires when boarding closes</p>
              <p className="text-xs text-slate-500 mt-1">Click QR to open claim page</p>
            </div>
          </div>

          {/* Why overlay */}
          {showWhy && (
            <div className="absolute inset-4 bg-slate-950/95 rounded-xl border border-slate-600 p-6 overflow-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">Why this ad?</h3>
                <button onClick={() => setShowWhy(false)} className="text-slate-400">
                  ✕
                </button>
              </div>
              <p className="text-sm text-slate-300 mb-3">
                Crowd profile at Gate {selectedGate} (next 15 min):
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <Bar label="Holiday" pct={hasDelay ? 58 : 32} />
                <Bar label="Family" pct={hasDelay ? 31 : 18} />
                <Bar label="Business" pct={hasDelay ? 22 : 45} />
                <Bar label="International" pct={hasDelay ? 57 : 40} />
              </div>
              <p className="text-sm text-slate-300 mb-2">Top candidates:</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between bg-emerald-900/40 px-2 py-1 rounded">
                  <span>Lumina Perfume 15% off</span>
                  <span className="text-emerald-400">0.86 ← playing</span>
                </div>
                <div className="flex justify-between bg-slate-800 px-2 py-1 rounded">
                  <span>TinyTravellers Buy 2 Get 1</span>
                  <span>0.52</span>
                </div>
                <div className="flex justify-between bg-slate-800 px-2 py-1 rounded">
                  <span>Horizon Lounge day pass</span>
                  <span>0.21</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Winning rule: highest audience match + delay boost ×1.5 (evidence-first pipeline)
              </p>
            </div>
          )}
        </div>

        {/* FIDS context strip */}
        <div className="mt-3 bg-slate-800 rounded-lg border border-slate-700 p-3">
          <p className="text-xs text-slate-400 mb-2">Nearby flights</p>
          <div className="flex gap-4 overflow-x-auto text-sm">
            {nearby.length === 0 && (
              <span className="text-slate-500">No departures in immediate window</span>
            )}
            {nearby.map((f) => (
              <div key={f.id} className="flex-shrink-0">
                <span className="font-medium">{f.flightNumber}</span>{" "}
                <span className="text-slate-400">{f.destination}</span>{" "}
                <span className="text-slate-500">
                  {format(new Date(f.estimatedDep || f.scheduledDep), "HH:mm")}
                </span>
                {f.delayMinutes > 0 && (
                  <span className="ml-1 text-amber-400">+{f.delayMinutes}m</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
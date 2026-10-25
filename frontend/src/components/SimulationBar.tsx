import { format } from "date-fns";

export function SimulationBar({ sim, isAdmin }: { sim: any; isAdmin: boolean }) {
  const timeStr = sim.currentTime
    ? format(sim.currentTime, "EEE d MMM HH:mm:ss")
    : "—";

  return (
    <div
      className={`px-4 py-2 flex items-center gap-4 text-sm border-b ${
        isAdmin ? "bg-slate-900/80 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-200"
      }`}
    >
      <div className="font-mono font-medium min-w-[180px]">{timeStr}</div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => (sim.isPlaying ? sim.pause() : sim.play())}
          className="px-3 py-1 rounded bg-sky-600 text-white text-xs font-medium"
        >
          {sim.isPlaying ? "Pause" : "Play"}
        </button>
        {([1, 10, 60] as const).map((s) => (
          <button
            key={s}
            onClick={() => sim.setSpeed(s)}
            className={`px-2 py-1 rounded text-xs ${
              sim.speed === s
                ? "bg-violet-600 text-white"
                : isAdmin
                ? "bg-slate-700 text-slate-300"
                : "bg-white border text-slate-600"
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-slate-500/40" />

      <div className="flex items-center gap-2">
        <span className="text-xs opacity-70">Inject:</span>
        <button
          onClick={() =>
            sim.inject("DELAY", {
              flightNumber: "XY501",
              delayMinutes: 45,
            })
          }
          className="px-2 py-1 rounded text-xs bg-amber-600/90 text-white"
        >
          Delay XY501 +45m
        </button>
        <button
          onClick={() =>
            sim.inject("GATE_CHANGE", {
              flightId: "flt-0042",
              newGate: "E7",
            })
          }
          className="px-2 py-1 rounded text-xs bg-orange-600/90 text-white"
        >
          Gate Change
        </button>
        <button
          onClick={() => sim.inject("SCREEN_OFFLINE", { screenId: "dummy" })}
          className="px-2 py-1 rounded text-xs bg-red-600/90 text-white"
        >
          Screen Offline
        </button>
      </div>

      <div className="ml-auto text-xs opacity-60">
        Simulation clock · all roles share this time
      </div>
    </div>
  );
}
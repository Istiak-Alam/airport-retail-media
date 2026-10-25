import { useState } from "react";
import { useSimulation } from "./hooks/useSimulation";
import { SimulationBar } from "./components/SimulationBar";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { AdminDashboard } from "./pages/AdminDashboard";
import { RetailerDashboard } from "./pages/RetailerDashboard";
import { MediaManagerDashboard } from "./pages/MediaManagerDashboard";
import { AirlineDashboard } from "./pages/AirlineDashboard";
import { PassengerScreen } from "./pages/PassengerScreen";
import { ClaimPage } from "./pages/ClaimPage";

export type Role = "admin" | "retailer" | "media" | "airline" | "passenger";

export default function App() {
  // Simple path-based routing for claim page (no react-router needed for POC)
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/claim")) {
    return <ClaimPage />;
  }

  const [role, setRole] = useState<Role>("admin");
  const [splitMode, setSplitMode] = useState(false);
  const sim = useSimulation();

  const isAdmin = role === "admin";
  const themeClass = isAdmin ? "admin-theme" : "business-theme";

  return (
    <div className={`min-h-screen flex flex-col ${themeClass}`}>
      <header
        className={`border-b px-4 py-2 flex items-center justify-between gap-4 ${
          isAdmin ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="font-bold text-lg tracking-tight">
            <span className="text-sky-500">Horizon</span> Media
          </div>
          <span className="text-xs opacity-60">HIA · Airport Retail Platform</span>
        </div>

        <RoleSwitcher role={role} onChange={setRole} isAdmin={isAdmin} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSplitMode((v) => !v)}
            className={`text-xs px-2 py-1 rounded ${
              splitMode ? "bg-sky-600 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            Split Demo
          </button>
          <div
            className={`text-xs px-2 py-1 rounded ${
              sim.connected ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {sim.connected ? "● Live" : "○ Offline"}
          </div>
        </div>
      </header>

      <SimulationBar sim={sim} isAdmin={isAdmin} />

      <main className="flex-1 overflow-auto">
        {splitMode ? (
          <div className="grid grid-cols-2 h-[calc(100vh-110px)]">
            <div className="border-r overflow-auto">
              <PassengerScreen sim={sim} compact />
            </div>
            <div className="overflow-auto">
              {role === "admin" && <AdminDashboard sim={sim} />}
              {role === "retailer" && <RetailerDashboard sim={sim} />}
              {role === "media" && <MediaManagerDashboard sim={sim} />}
              {role === "airline" && <AirlineDashboard sim={sim} />}
              {role === "passenger" && <PassengerScreen sim={sim} />}
            </div>
          </div>
        ) : (
          <>
            {role === "admin" && <AdminDashboard sim={sim} />}
            {role === "retailer" && <RetailerDashboard sim={sim} />}
            {role === "media" && <MediaManagerDashboard sim={sim} />}
            {role === "airline" && <AirlineDashboard sim={sim} />}
            {role === "passenger" && <PassengerScreen sim={sim} />}
          </>
        )}
      </main>
    </div>
  );
}

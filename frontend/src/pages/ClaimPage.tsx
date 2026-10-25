import { useEffect, useState } from "react";
import { api } from "../lib/api";

/**
 * Mobile claim page opened when passenger scans the QR.
 * Served at /claim so the QR can encode the LAN IP.
 */
export function ClaimPage() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code") || "HIADEMO";
  const campaignId = params.get("campaignId") || undefined;
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Auto-claim on open for smooth demo
    if (status === "idle") {
      setStatus("loading");
      api
        .redeem(code, campaignId)
        .then(() => {
          setStatus("ok");
          setMessage("Offer claimed! Show this screen at the store.");
        })
        .catch(() => {
          setStatus("error");
          setMessage("Could not claim – try again or ask staff.");
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-600 to-sky-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 max-w-sm w-full text-center border border-white/20">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-xl font-bold mb-2">Horizon Media</h1>
        <p className="text-sky-100 text-sm mb-6">Promo claim</p>

        {status === "loading" && <p className="text-white/80">Claiming your offer…</p>}
        {status === "ok" && (
          <>
            <p className="text-lg font-semibold text-emerald-300 mb-2">{message}</p>
            <div className="bg-white text-slate-900 rounded-xl p-4 mt-4">
              <p className="text-xs text-slate-500">Your code</p>
              <p className="text-2xl font-mono font-bold tracking-widest">{code}</p>
            </div>
            <p className="text-xs text-sky-200 mt-4">Valid until the linked flight’s boarding closes</p>
          </>
        )}
        {status === "error" && <p className="text-red-300">{message}</p>}
      </div>
    </div>
  );
}
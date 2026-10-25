import { useState } from "react";

/**
 * GenAI Creative Assistant – mocked offline, pluggable real provider.
 * Type a brief → get a ready ad page in the template (EN + second language).
 */
const TEMPLATES = [
  {
    id: "promo-standard",
    name: "Standard Promo",
    render: (h: string, body: string, cta: string) => ({
      headline: h,
      body,
      cta,
    }),
  },
];

const MOCK_RESPONSES: Record<string, { en: any; es: any }> = {
  default: {
    en: {
      headline: "Special Offer for Travellers",
      body: "Limited time deal exclusive to airport guests.",
      cta: "Scan to claim",
    },
    es: {
      headline: "Oferta especial para viajeros",
      body: "Oferta por tiempo limitado exclusiva para huéspedes del aeropuerto.",
      cta: "Escanea para reclamar",
    },
  },
};

function mockGenerate(brief: string, lang2: string) {
  const lower = brief.toLowerCase();
  let en = { ...MOCK_RESPONSES.default.en };
  let es = { ...MOCK_RESPONSES.default.es };

  if (lower.includes("sweet") || lower.includes("festive") || lower.includes("family")) {
    en = {
      headline: "Festive Sweets – 20% Off for Families",
      body: "Celebrate the journey with our seasonal selection. Perfect for families flying domestic.",
      cta: "Claim family offer",
    };
    es = {
      headline: "Dulces festivos – 20% dto. para familias",
      body: "Celebra el viaje con nuestra selección de temporada. Ideal para familias en vuelos nacionales.",
      cta: "Reclamar oferta familiar",
    };
  } else if (lower.includes("perfume") || lower.includes("duty")) {
    en = {
      headline: "Lumina Perfume – 15% Off International",
      body: "Exclusive airport price for international departures. Valid while you wait.",
      cta: "Scan for 15% off",
    };
    es = {
      headline: "Perfume Lumina – 15% dto. internacional",
      body: "Precio exclusivo de aeropuerto para salidas internacionales.",
      cta: "Escanea para 15% dto.",
    };
  } else if (lower.includes("lounge") || lower.includes("delay")) {
    en = {
      headline: "Delayed? Lounge Day Pass 50% Off",
      body: "Relax while you wait. Co-funded goodwill offer for delayed passengers.",
      cta: "Get lounge pass",
    };
    es = {
      headline: "¿Retraso? Pase de sala 50% dto.",
      body: "Relájate mientras esperas. Oferta de buena voluntad para pasajeros retrasados.",
      cta: "Obtener pase de sala",
    };
  } else if (lower.includes("coffee") || lower.includes("bean")) {
    en = {
      headline: "AromaBean – Free Size Upgrade",
      body: "Any drink, one size up – on us when your flight is delayed.",
      cta: "Claim free upgrade",
    };
    es = {
      headline: "AromaBean – Mejora de tamaño gratis",
      body: "Cualquier bebida, un tamaño más – cortesía si tu vuelo se retrasa.",
      cta: "Reclamar mejora gratis",
    };
  }

  return { en, [lang2]: es };
}

export function GenAICreative({ onUse }: { onUse?: (creative: any) => void }) {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const lang2 = "es";

  const generate = () => {
    if (!brief.trim()) return;
    setLoading(true);
    // Simulate network / model latency
    setTimeout(() => {
      const out = mockGenerate(brief, lang2);
      setResult(out);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h2 className="font-semibold text-slate-800 mb-1">GenAI Creative Assistant</h2>
      <p className="text-xs text-slate-500 mb-3">
        Mocked offline · pluggable real provider. Type a brief → ready ad in English + {lang2.toUpperCase()}.
      </p>
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder='e.g. "Festive sweets, 20% off, families flying domestic"'
        className="w-full border rounded-lg p-3 text-sm h-20 resize-none"
      />
      <button
        onClick={generate}
        disabled={loading || !brief.trim()}
        className="mt-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate ad"}
      </button>

      {result && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(result).map(([lang, c]: [string, any]) => (
            <div key={lang} className="border rounded-lg p-3 bg-slate-50">
              <div className="text-xs font-medium text-slate-500 mb-1 uppercase">{lang}</div>
              <p className="font-semibold text-slate-900">{c.headline}</p>
              <p className="text-sm text-slate-600 mt-1">{c.body}</p>
              <p className="text-sm text-sky-600 mt-2 font-medium">{c.cta}</p>
              {onUse && (
                <button
                  onClick={() => onUse({ ...c, language: lang })}
                  className="mt-2 text-xs text-violet-600 font-medium"
                >
                  Use this creative
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import GaugeChart from "@/components/GaugeChart";
import { api, type PredictionResponse } from "@/lib/api";

export default function PredictPage() {
  const [form, setForm] = useState({
    temps_sommeil: 7,
    temps_etude: 4,
    temps_distraction: 2,
    moment_etude: "matin" as "matin" | "soir",
    concentration: 3,
  });
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const prediction = await api.predict(form);
      setResult(prediction);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de prédiction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Prédire</span> votre MGP
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Entrez vos habitudes de vie et notre modèle de régression linéaire
          multiple estimera votre MGP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Input Form ───────────────────────────────────── */}
        <form onSubmit={handlePredict} className="space-y-5">
          {/* Sleep */}
          <div className="glass p-5 rounded-2xl border border-white/5">
            <label className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-300 font-medium">
                😴 Temps de Sommeil
              </span>
              <span className="text-cyan-400 font-bold">
                {form.temps_sommeil}h
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="14"
              step="0.5"
              value={form.temps_sommeil}
              onChange={(e) =>
                setForm({ ...form, temps_sommeil: parseFloat(e.target.value) })
              }
              className="slider-cyber"
            />
          </div>

          {/* Study */}
          <div className="glass p-5 rounded-2xl border border-white/5">
            <label className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-300 font-medium">
                📚 Temps d&apos;Étude
              </span>
              <span className="text-cyan-400 font-bold">
                {form.temps_etude}h
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              value={form.temps_etude}
              onChange={(e) =>
                setForm({ ...form, temps_etude: parseFloat(e.target.value) })
              }
              className="slider-cyber"
            />
          </div>

          {/* Distraction */}
          <div className="glass p-5 rounded-2xl border border-white/5">
            <label className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-300 font-medium">
                📱 Temps de Distraction
              </span>
              <span className="text-amber-400 font-bold">
                {form.temps_distraction}h
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={form.temps_distraction}
              onChange={(e) =>
                setForm({
                  ...form,
                  temps_distraction: parseFloat(e.target.value),
                })
              }
              className="slider-cyber"
            />
          </div>

          {/* Moment */}
          <div className="glass p-5 rounded-2xl border border-white/5">
            <label className="block text-sm text-slate-300 font-medium mb-3">
              ⏰ Moment d&apos;Étude
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, moment_etude: "matin" })}
                className={`p-3 rounded-xl text-center text-sm font-medium transition-all duration-300 ${
                  form.moment_etude === "matin"
                    ? "bg-amber-500/20 border border-amber-500/30 text-white"
                    : "glass-subtle text-slate-400 hover:text-white"
                }`}
              >
                🌅 Matin
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, moment_etude: "soir" })}
                className={`p-3 rounded-xl text-center text-sm font-medium transition-all duration-300 ${
                  form.moment_etude === "soir"
                    ? "bg-indigo-500/20 border border-indigo-500/30 text-white"
                    : "glass-subtle text-slate-400 hover:text-white"
                }`}
              >
                🌙 Soir
              </button>
            </div>
          </div>

          {/* Concentration */}
          <div className="glass p-5 rounded-2xl border border-white/5">
            <label className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-300 font-medium">
                🧠 Concentration
              </span>
              <span className="text-violet-400 font-bold">
                {form.concentration}/5
              </span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, concentration: level })}
                  className={`
                    flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                    ${
                      form.concentration >= level
                        ? "bg-violet-500/25 border border-violet-500/30 text-white"
                        : "glass-subtle text-slate-500"
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary py-4 text-base ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calcul en cours...
              </span>
            ) : (
              "🔮 Prédire ma MGP"
            )}
          </button>
        </form>

        {/* ── Results Panel ────────────────────────────────── */}
        <div className="space-y-5">
          {!result && !error && (
            <div className="glass p-8 rounded-2xl border border-white/5 flex flex-col items-center justify-center min-h-[400px] text-center">
              <span className="text-6xl mb-4 opacity-30">🔮</span>
              <p className="text-slate-500 text-sm">
                Ajustez les paramètres et cliquez sur
                <br />
                <span className="text-cyan-400 font-medium">
                  &quot;Prédire ma MGP&quot;
                </span>{" "}
                pour voir le résultat.
              </p>
            </div>
          )}

          {error && (
            <div className="glass p-6 rounded-2xl border border-red-500/20 text-center">
              <span className="text-4xl block mb-3">⚠️</span>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-slide-up">
              {/* Gauge */}
              <div className="glass p-6 rounded-2xl border border-cyan-500/20 flex flex-col items-center">
                <GaugeChart value={result.mgp_predite} size={220} />
                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-400">
                    Intervalle de confiance (95%)
                  </p>
                  <p className="text-base font-bold text-white">
                    [{result.intervalle_confiance[0]} —{" "}
                    {result.intervalle_confiance[1]}]
                  </p>
                </div>
              </div>

              {/* Contributions */}
              <div className="glass p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Contribution de chaque variable
                </h3>
                <div className="space-y-3">
                  {Object.entries(result.contributions).map(
                    ([key, value]) => {
                      const labels: Record<string, string> = {
                        temps_sommeil: "😴 Sommeil",
                        temps_etude: "📚 Étude",
                        temps_distraction: "📱 Distraction",
                        concentration: "🧠 Concentration",
                        moment_soir: "🌙 Moment (soir)",
                      };
                      const isPositive = value >= 0;
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 w-32 shrink-0">
                            {labels[key] || key}
                          </span>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  isPositive
                                    ? "bg-emerald-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    Math.abs(value) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span
                              className={`text-xs font-mono w-16 text-right ${
                                isPositive
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {isPositive ? "+" : ""}
                              {value.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="glass p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-3">
                  💡 Recommandations
                </h3>
                <div className="space-y-2">
                  {result.recommandations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/[0.02] text-sm text-slate-300 border border-white/5"
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

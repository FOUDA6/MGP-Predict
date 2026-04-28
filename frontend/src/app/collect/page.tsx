"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type StudentDataCreate } from "@/lib/api";

export default function CollectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<StudentDataCreate>({
    temps_sommeil: 7,
    temps_etude: 4,
    temps_distraction: 2,
    moment_etude: "matin",
    concentration: 3,
    mgp: 2.5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createStudent(form);
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="glass p-10 rounded-2xl text-center max-w-md">
          <div className="text-6xl mb-4 animate-float">✅</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Données enregistrées !
          </h2>
          <p className="text-slate-400 text-sm">
            Redirection vers le dashboard...
          </p>
          <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-cyber rounded-full animate-shimmer"
              style={{
                width: "100%",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Collecter</span> vos Données
        </h1>
        <p className="text-slate-400 text-sm">
          Renseignez vos habitudes de vie pour enrichir notre modèle d&apos;analyse.
          Toutes les données sont anonymes.
        </p>
      </div>

      {/* ── Form ───────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temps de Sommeil */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            😴 Habitudes de Sommeil & Distraction
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Temps de Sommeil
                <span className="text-cyan-400 ml-1">
                  ({form.temps_sommeil}h)
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
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>0h</span>
                <span>7h</span>
                <span>14h</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Temps de Distraction
                <span className="text-amber-400 ml-1">
                  ({form.temps_distraction}h)
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
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>0h</span>
                <span>6h</span>
                <span>12h</span>
              </div>
            </div>
          </div>

          {form.temps_sommeil < 5 && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
              ⚠️ Moins de 5h de sommeil réduit significativement la
              concentration effective.
            </div>
          )}

          {form.temps_distraction > 4 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
              ⚠️ Plus de 4h de distraction impacte négativement la MGP.
            </div>
          )}
        </div>

        {/* Temps d'Étude & Concentration */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            📚 Habitudes d&apos;Étude
          </h3>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Temps d&apos;Étude
              <span className="text-cyan-400 ml-1">({form.temps_etude}h)</span>
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
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>0h</span>
              <span>8h</span>
              <span>16h</span>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Moment d&apos;Étude Préféré
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, moment_etude: "matin" })}
                className={`p-4 rounded-xl text-center transition-all duration-300 ${
                  form.moment_etude === "matin"
                    ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-white"
                    : "glass-subtle text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-2xl block mb-1">🌅</span>
                <span className="text-sm font-medium">Matin</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, moment_etude: "soir" })}
                className={`p-4 rounded-xl text-center transition-all duration-300 ${
                  form.moment_etude === "soir"
                    ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-white"
                    : "glass-subtle text-slate-400 hover:text-white"
                }`}
              >
                <span className="text-2xl block mb-1">🌙</span>
                <span className="text-sm font-medium">Soir</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Intensité de Concentration
              <span className="text-violet-400 ml-1">
                ({form.concentration}/5)
              </span>
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, concentration: level })}
                  className={`
                    flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300
                    ${
                      form.concentration >= level
                        ? "bg-gradient-to-b from-violet-500/30 to-violet-600/20 border border-violet-500/30 text-white shadow-md"
                        : "glass-subtle text-slate-500 hover:text-slate-300"
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>Faible</span>
              <span>Modérée</span>
              <span>Intense</span>
            </div>
          </div>
        </div>

        {/* MGP actuelle */}
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            🎓 Moyenne Générale Pondérée
          </h3>
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              MGP actuelle
              <span className="text-emerald-400 ml-1">
                ({form.mgp.toFixed(1)})
              </span>
            </label>
            <input
              type="number"
              min="0"
              max="4"
              step="0.1"
              value={form.mgp}
              onChange={(e) =>
                setForm({
                  ...form,
                  mgp: Math.min(4, Math.max(0, parseFloat(e.target.value) || 0)),
                })
              }
              className="input-cyber text-center text-2xl font-bold"
              placeholder="2.50"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-2">
              <span>0.0 — Insuffisant</span>
              <span>2.0 — Passable</span>
              <span>4.0 — Excellent</span>
            </div>
          </div>
        </div>

        {/* Summary Preview */}
        <div className="glass p-4 rounded-2xl border border-cyan-500/10 bg-gradient-to-r from-cyan-500/5 to-violet-500/5">
          <p className="text-xs text-slate-500 mb-2 font-medium">RÉSUMÉ</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-300">
              😴 {form.temps_sommeil}h sommeil
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-300">
              📚 {form.temps_etude}h étude
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-300">
              📱 {form.temps_distraction}h distraction
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-300">
              {form.moment_etude === "matin" ? "🌅" : "🌙"}{" "}
              {form.moment_etude}
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-300">
              🧠 {form.concentration}/5
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/5 text-slate-300">
              🎓 MGP: {form.mgp.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
            ❌ {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className={`
            w-full btn-primary text-base py-4
            ${submitting ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Envoi en cours...
            </span>
          ) : (
            "📤 Soumettre mes données"
          )}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import StatsCard from "@/components/StatsCard";
import ChartScatter from "@/components/ChartScatter";
import ChartBar from "@/components/ChartBar";
import ChartBubble from "@/components/ChartBubble";
import {
  api,
  type StatsResponse,
  type ScatterDataResponse,
  type SweetSpotResponse,
  type RegressionResponse,
  type CorrelationItem,
} from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [scatter, setScatter] = useState<ScatterDataResponse | null>(null);
  const [sweetSpot, setSweetSpot] = useState<SweetSpotResponse | null>(null);
  const [regression, setRegression] = useState<RegressionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, scatterData, sweetSpotData, regressionData] =
          await Promise.all([
            api.getStats(),
            api.getScatterData(),
            api.getSweetSpot(),
            api.getRegression(),
          ]);
        setStats(statsData);
        setScatter(scatterData);
        setSweetSpot(sweetSpotData);
        setRegression(regressionData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur de chargement"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass p-8 rounded-2xl text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Erreur de connexion</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <p className="text-slate-500 text-xs">
            Assurez-vous que le serveur FastAPI est démarré sur le port 8000.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-4 text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Hero Section ───────────────────────────────────── */}
      <div className="animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="gradient-text">Dashboard</span> d&apos;Analyse
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Visualisation des données collectées et analyse statistique des
          habitudes de vie des étudiants en relation avec leur MGP.
        </p>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatsCard
          title="Étudiants"
          value={stats?.total_etudiants || 0}
          subtitle="Entrées collectées"
          icon="👥"
          color="cyan"
        />
        <StatsCard
          title="MGP Moyenne"
          value={stats?.mgp_moyenne?.toFixed(2) || "—"}
          subtitle={`Médiane: ${stats?.mgp_mediane?.toFixed(2) || "—"}`}
          icon="📊"
          color="violet"
        />
        <StatsCard
          title="Écart-Type"
          value={stats?.mgp_ecart_type?.toFixed(2) || "—"}
          subtitle="Dispersion des MGP"
          icon="📐"
          color="amber"
        />
        <StatsCard
          title="R² du Modèle"
          value={
            regression?.r_squared !== undefined
              ? `${(regression.r_squared * 100).toFixed(1)}%`
              : "—"
          }
          subtitle="Qualité de la régression"
          icon="🎯"
          color="emerald"
        />
      </div>

      {/* ── Charts Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scatter && <ChartScatter data={scatter} />}
        {stats && <ChartBar repartition={stats.repartition_mgp} />}
      </div>

      {/* ── Bubble Chart (Full Width) ──────────────────────── */}
      {scatter && (
        <ChartBubble
          points={scatter.points}
          sweetSpot={
            sweetSpot
              ? {
                  sommeil_optimal: sweetSpot.sommeil_optimal,
                  etude_optimale: sweetSpot.etude_optimale,
                  mgp_estimee: sweetSpot.mgp_estimee,
                }
              : undefined
          }
        />
      )}

      {/* ── Correlations Table ─────────────────────────────── */}
      {stats && stats.correlations.length > 0 && (
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-1">
            Coefficients de Corrélation
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Corrélation de Pearson entre chaque variable et la MGP
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Variable
                  </th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">
                    Coefficient (r)
                  </th>
                  <th className="text-center py-3 px-4 text-slate-400 font-medium">
                    Force
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Interprétation
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.correlations.map((c: CorrelationItem, i: number) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-medium">
                      {c.variable}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono font-bold ${
                          c.coefficient > 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {c.coefficient > 0 ? "+" : ""}
                        {c.coefficient.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CorrelationBar value={c.coefficient} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {c.interpretation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Regression Equation ────────────────────────────── */}
      {regression && (
        <div className="glass p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-semibold text-white mb-4">
            Équation de Régression
          </h3>
          <div className="bg-black/30 rounded-xl p-4 font-mono text-sm text-cyan-300 overflow-x-auto">
            {regression.equation}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 rounded-xl bg-white/[0.02]">
              <p className="text-xs text-slate-500 mb-1">Intercept (β₀)</p>
              <p className="text-lg font-bold text-white">
                {regression.intercept.toFixed(3)}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.02]">
              <p className="text-xs text-slate-500 mb-1">R²</p>
              <p className="text-lg font-bold text-emerald-400">
                {(regression.r_squared * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.02]">
              <p className="text-xs text-slate-500 mb-1">Erreur Standard</p>
              <p className="text-lg font-bold text-amber-400">
                {regression.erreur_standard.toFixed(3)}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white/[0.02]">
              <p className="text-xs text-slate-500 mb-1">Variables</p>
              <p className="text-lg font-bold text-violet-400">
                {Object.keys(regression.coefficients).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Sweet Spot Card ────────────────────────────────── */}
      {sweetSpot && (
        <div className="glass p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-cyan-500/5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            🎯 Sweet Spot — Point d&apos;Équilibre Optimal
          </h3>
          <p className="text-sm text-slate-400 mb-4">{sweetSpot.message}</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <SweetSpotItem
              label="Sommeil"
              value={`${sweetSpot.sommeil_optimal}h`}
              icon="😴"
            />
            <SweetSpotItem
              label="Étude"
              value={`${sweetSpot.etude_optimale}h`}
              icon="📚"
            />
            <SweetSpotItem
              label="Distraction max"
              value={`${sweetSpot.distraction_max}h`}
              icon="📱"
            />
            <SweetSpotItem
              label="Concentration"
              value={`${sweetSpot.concentration_ideale}/5`}
              icon="🧠"
            />
            <SweetSpotItem
              label="MGP Estimée"
              value={sweetSpot.mgp_estimee.toFixed(2)}
              icon="🏆"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────

function CorrelationBar({ value }: { value: number }) {
  const width = Math.abs(value) * 100;
  const isPositive = value >= 0;

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isPositive ? "bg-emerald-500" : "bg-red-500"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function SweetSpotItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="text-center p-3 rounded-xl glass-subtle">
      <span className="text-2xl">{icon}</span>
      <p className="text-lg font-bold text-white mt-1">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

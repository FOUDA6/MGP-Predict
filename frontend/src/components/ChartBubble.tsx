"use client";

import { Bubble } from "react-chartjs-2";
import "@/lib/chartSetup";
import type { ScatterPoint } from "@/lib/api";

interface Props {
  points: ScatterPoint[];
  sweetSpot?: {
    sommeil_optimal: number;
    etude_optimale: number;
    mgp_estimee: number;
  };
}

export default function ChartBubble({ points, sweetSpot }: Props) {
  const chartData = {
    datasets: [
      {
        label: "Étudiants (taille = MGP)",
        data: points.map((p) => ({
          x: p.temps_sommeil,
          y: p.temps_etude,
          r: Math.max(3, p.mgp * 4),
        })),
        backgroundColor: points.map((p) => {
          const hue = (p.mgp / 4) * 120; // 0=red, 120=green
          return `hsla(${hue}, 70%, 50%, 0.5)`;
        }),
        borderColor: points.map((p) => {
          const hue = (p.mgp / 4) * 120;
          return `hsla(${hue}, 70%, 50%, 0.9)`;
        }),
        borderWidth: 1,
      },
      // Sweet spot marker
      ...(sweetSpot
        ? [
            {
              label: "🎯 Sweet Spot",
              data: [
                {
                  x: sweetSpot.sommeil_optimal,
                  y: sweetSpot.etude_optimale,
                  r: 15,
                },
              ],
              backgroundColor: "rgba(139, 92, 246, 0.4)",
              borderColor: "rgba(139, 92, 246, 1)",
              borderWidth: 3,
              pointStyle: "star" as const,
            },
          ]
        : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#94a3b8",
          font: { family: "Inter", size: 12 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.95)",
        titleColor: "#e2e8f0",
        bodyColor: "#94a3b8",
        borderColor: "rgba(139, 92, 246, 0.3)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: "Inter", weight: "bold" as const },
        bodyFont: { family: "Inter" },
        callbacks: {
          label: (ctx: { parsed: { x: number; y: number }; raw: { r: number } }) =>
            `Sommeil: ${ctx.parsed.x}h, Étude: ${ctx.parsed.y}h`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Temps de Sommeil (heures)",
          color: "#94a3b8",
          font: { family: "Inter", size: 13, weight: 600 },
        },
        ticks: { color: "#64748b", font: { family: "Inter" } },
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        border: { color: "rgba(255, 255, 255, 0.08)" },
      },
      y: {
        title: {
          display: true,
          text: "Temps d'Étude (heures)",
          color: "#94a3b8",
          font: { family: "Inter", size: 13, weight: 600 },
        },
        ticks: { color: "#64748b", font: { family: "Inter" } },
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        border: { color: "rgba(255, 255, 255, 0.08)" },
      },
    },
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 hover:border-pink-500/20 transition-all duration-500">
      <h3 className="text-lg font-semibold text-white mb-1">
        Sweet Spot — Sommeil vs Étude
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Taille des bulles proportionnelle à la MGP
      </p>
      <div className="h-[350px]">
        <Bubble data={chartData} options={options} />
      </div>
      {sweetSpot && (
        <div className="mt-4 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-violet-300">
          🎯 Point optimal : {sweetSpot.sommeil_optimal}h sommeil + {sweetSpot.etude_optimale}h étude → MGP ≈ {sweetSpot.mgp_estimee}
        </div>
      )}
    </div>
  );
}

"use client";

import { Scatter } from "react-chartjs-2";
import "@/lib/chartSetup";
import type { TooltipItem, ChartDataset } from "chart.js";
import type { ScatterDataResponse } from "@/lib/api";

interface Props {
  data: ScatterDataResponse;
}

export default function ChartScatter({ data }: Props) {
  const scatterDataset: ChartDataset<"scatter"> = {
    label: "Étudiants",
    data: data.points.map((p) => ({ x: p.temps_etude, y: p.mgp })),
    backgroundColor: data.points.map((p) => {
      if (p.mgp >= 3.0) return "rgba(16, 185, 129, 0.7)";
      if (p.mgp >= 2.0) return "rgba(14, 165, 233, 0.7)";
      if (p.mgp >= 1.5) return "rgba(245, 158, 11, 0.7)";
      return "rgba(239, 68, 68, 0.7)";
    }),
    borderColor: data.points.map((p) => {
      if (p.mgp >= 3.0) return "rgba(16, 185, 129, 1)";
      if (p.mgp >= 2.0) return "rgba(14, 165, 233, 1)";
      if (p.mgp >= 1.5) return "rgba(245, 158, 11, 1)";
      return "rgba(239, 68, 68, 1)";
    }),
    borderWidth: 1,
    pointRadius: 5,
    pointHoverRadius: 8,
  };

  // Regression line — typed as any to allow mixing line into scatter chart
  const regressionDataset =
    data.regression_line.x.length > 0
      ? ([
          {
            label: "Régression linéaire",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: "line" as any,
            data: data.regression_line.x.map((x, i) => ({
              x,
              y: data.regression_line.y[i],
            })),
            borderColor: "rgba(139, 92, 246, 0.8)",
            borderWidth: 2,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
            showLine: true,
          },
        ] as ChartDataset<"scatter">[])
      : [];

  const chartData = {
    datasets: [scatterDataset, ...regressionDataset],
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
        borderColor: "rgba(14, 165, 233, 0.3)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        titleFont: { family: "Inter", weight: "bold" as const },
        bodyFont: { family: "Inter" },
        callbacks: {
          label: (ctx: TooltipItem<"scatter">) =>
            `Étude: ${ctx.parsed.x ?? 0}h → MGP: ${(ctx.parsed.y ?? 0).toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
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
      y: {
        title: {
          display: true,
          text: "MGP",
          color: "#94a3b8",
          font: { family: "Inter", size: 13, weight: 600 },
        },
        min: 0,
        max: 4,
        ticks: { color: "#64748b", font: { family: "Inter" } },
        grid: { color: "rgba(255, 255, 255, 0.04)" },
        border: { color: "rgba(255, 255, 255, 0.08)" },
      },
    },
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all duration-500">
      <h3 className="text-lg font-semibold text-white mb-1">
        Corrélation Étude ↔ MGP
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Scatter plot avec ligne de régression
      </p>
      <div className="h-[350px]">
        <Scatter data={chartData} options={options} />
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          MGP ≥ 3.0
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
          MGP ≥ 2.0
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          MGP ≥ 1.5
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          MGP &lt; 1.5
        </span>
      </div>
    </div>
  );
}

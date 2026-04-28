"use client";

import { Bar } from "react-chartjs-2";
import "@/lib/chartSetup";

interface Props {
  repartition: Record<string, number>;
}

export default function ChartBar({ repartition }: Props) {
  const labels = Object.keys(repartition);
  const values = Object.values(repartition);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Nombre d'étudiants",
        data: values,
        backgroundColor: [
          "rgba(239, 68, 68, 0.6)",
          "rgba(245, 158, 11, 0.6)",
          "rgba(245, 158, 11, 0.6)",
          "rgba(14, 165, 233, 0.6)",
          "rgba(14, 165, 233, 0.6)",
          "rgba(16, 185, 129, 0.6)",
          "rgba(16, 185, 129, 0.6)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(14, 165, 233, 1)",
          "rgba(14, 165, 233, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(16, 185, 129, 1)",
        ],
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Fourchette MGP",
          color: "#94a3b8",
          font: { family: "Inter", size: 13, weight: 600 },
        },
        ticks: { color: "#64748b", font: { family: "Inter", size: 11 } },
        grid: { display: false },
        border: { color: "rgba(255, 255, 255, 0.08)" },
      },
      y: {
        title: {
          display: true,
          text: "Effectif",
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
    <div className="glass p-6 rounded-2xl border border-white/5 hover:border-violet-500/20 transition-all duration-500">
      <h3 className="text-lg font-semibold text-white mb-1">
        Répartition de l&apos;Échantillon
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Distribution des MGP par fourchettes
      </p>
      <div className="h-[350px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

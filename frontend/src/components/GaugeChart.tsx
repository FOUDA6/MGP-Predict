"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: number;
  max?: number;
  label?: string;
  size?: number;
}

export default function GaugeChart({
  value,
  max = 4,
  label = "MGP Prédite",
  size = 200,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    const startAngle = (3 * Math.PI) / 4;
    const endAngle = (Math.PI) / 4;
    const totalAngle = 2 * Math.PI - (startAngle - endAngle);

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle + 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();

    // Value arc
    const percentage = Math.min(value / max, 1);
    const valueAngle = startAngle + totalAngle * percentage;

    // Gradient
    const gradient = ctx.createLinearGradient(0, size, size, 0);
    if (percentage >= 0.75) {
      gradient.addColorStop(0, "#10b981");
      gradient.addColorStop(1, "#34d399");
    } else if (percentage >= 0.5) {
      gradient.addColorStop(0, "#0ea5e9");
      gradient.addColorStop(1, "#38bdf8");
    } else if (percentage >= 0.35) {
      gradient.addColorStop(0, "#f59e0b");
      gradient.addColorStop(1, "#fbbf24");
    } else {
      gradient.addColorStop(0, "#ef4444");
      gradient.addColorStop(1, "#f87171");
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.shadowColor = percentage >= 0.5 ? "#0ea5e9" : "#f59e0b";
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center text - value
    ctx.fillStyle = "#e2e8f0";
    ctx.font = `bold ${size / 4.5}px Inter`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value.toFixed(2), centerX, centerY - 5);

    // Label
    ctx.fillStyle = "#64748b";
    ctx.font = `500 ${size / 14}px Inter`;
    ctx.fillText(`/ ${max.toFixed(1)}`, centerX, centerY + size / 7);

  }, [value, max, size]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="drop-shadow-lg"
      />
      <p className="text-sm text-slate-400 mt-2 font-medium">{label}</p>
    </div>
  );
}

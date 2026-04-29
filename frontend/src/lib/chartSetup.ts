"use client";

import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarController,
  BubbleController,
  ScatterController,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement,
  ArcElement,
  Filler,
} from "chart.js";

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarController,
  BubbleController,
  ScatterController,
  Tooltip,
  Legend,
  CategoryScale,
  BarElement,
  ArcElement,
  Filler
);

export { ChartJS };

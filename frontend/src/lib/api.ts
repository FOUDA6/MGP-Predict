/**
 * MGP-Predict — API Client
 * Functions to interact with the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ────────────────────────────────────────────────────

export interface StudentData {
  id: number;
  temps_sommeil: number;
  temps_etude: number;
  temps_distraction: number;
  moment_etude: "matin" | "soir";
  concentration: number;
  mgp: number;
  created_at: string;
}

export interface StudentDataCreate {
  temps_sommeil: number;
  temps_etude: number;
  temps_distraction: number;
  moment_etude: "matin" | "soir";
  concentration: number;
  mgp: number;
}

export interface CorrelationItem {
  variable: string;
  coefficient: number;
  interpretation: string;
}

export interface StatsResponse {
  total_etudiants: number;
  mgp_moyenne: number;
  mgp_mediane: number;
  mgp_ecart_type: number;
  correlations: CorrelationItem[];
  repartition_mgp: Record<string, number>;
  r_squared: number;
}

export interface PredictionRequest {
  temps_sommeil: number;
  temps_etude: number;
  temps_distraction: number;
  moment_etude: "matin" | "soir";
  concentration: number;
}

export interface PredictionResponse {
  mgp_predite: number;
  contributions: Record<string, number>;
  intervalle_confiance: number[];
  recommandations: string[];
}

export interface RegressionResponse {
  coefficients: Record<string, number>;
  intercept: number;
  r_squared: number;
  erreur_standard: number;
  equation: string;
}

export interface SweetSpotResponse {
  sommeil_optimal: number;
  etude_optimale: number;
  distraction_max: number;
  concentration_ideale: number;
  mgp_estimee: number;
  message: string;
}

export interface ScatterPoint {
  temps_sommeil: number;
  temps_etude: number;
  temps_distraction: number;
  moment_etude: string;
  concentration: number;
  mgp: number;
}

export interface ScatterDataResponse {
  points: ScatterPoint[];
  regression_line: {
    x: number[];
    y: number[];
  };
}

// ── API Functions ────────────────────────────────────────────

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erreur serveur" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Students
  createStudent: (data: StudentDataCreate) =>
    fetchAPI<StudentData>("/api/students", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listStudents: () => fetchAPI<StudentData[]>("/api/students"),

  // Statistics
  getStats: () => fetchAPI<StatsResponse>("/api/stats"),

  // Prediction
  predict: (data: PredictionRequest) =>
    fetchAPI<PredictionResponse>("/api/predict", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Regression
  getRegression: () => fetchAPI<RegressionResponse>("/api/regression"),

  // Sweet Spot
  getSweetSpot: () => fetchAPI<SweetSpotResponse>("/api/sweet-spot"),

  // Scatter Data (for charts)
  getScatterData: () => fetchAPI<ScatterDataResponse>("/api/scatter-data"),
};

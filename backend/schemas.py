"""
MGP-Predict — Pydantic Schemas
Request/Response models for the API.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ── Student Data ──────────────────────────────────────────────

class StudentDataCreate(BaseModel):
    temps_sommeil: float = Field(..., ge=0, le=14, description="Heures de sommeil")
    temps_etude: float = Field(..., ge=0, le=16, description="Heures d'étude")
    temps_distraction: float = Field(..., ge=0, le=12, description="Heures de distraction")
    moment_etude: Literal["matin", "soir"] = Field(..., description="Moment d'étude")
    concentration: int = Field(..., ge=1, le=5, description="Intensité de concentration")
    mgp: float = Field(..., ge=0, le=4, description="MGP actuelle")


class StudentDataResponse(BaseModel):
    id: int
    temps_sommeil: float
    temps_etude: float
    temps_distraction: float
    moment_etude: str
    concentration: int
    mgp: float
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Prediction ────────────────────────────────────────────────

class PredictionRequest(BaseModel):
    temps_sommeil: float = Field(..., ge=0, le=14)
    temps_etude: float = Field(..., ge=0, le=16)
    temps_distraction: float = Field(..., ge=0, le=12)
    moment_etude: Literal["matin", "soir"]
    concentration: int = Field(..., ge=1, le=5)


class PredictionResponse(BaseModel):
    mgp_predite: float
    contributions: dict[str, float]
    intervalle_confiance: list[float]
    recommandations: list[str]


# ── Statistics ────────────────────────────────────────────────

class CorrelationItem(BaseModel):
    variable: str
    coefficient: float
    interpretation: str


class StatsResponse(BaseModel):
    total_etudiants: int
    mgp_moyenne: float
    mgp_mediane: float
    mgp_ecart_type: float
    correlations: list[CorrelationItem]
    repartition_mgp: dict[str, int]
    r_squared: float


# ── Regression ────────────────────────────────────────────────

class RegressionResponse(BaseModel):
    coefficients: dict[str, float]
    intercept: float
    r_squared: float
    erreur_standard: float
    equation: str


# ── Sweet Spot ────────────────────────────────────────────────

class SweetSpotResponse(BaseModel):
    sommeil_optimal: float
    etude_optimale: float
    distraction_max: float
    concentration_ideale: int
    mgp_estimee: float
    message: str

"""
MGP-Predict — API Routes
All FastAPI endpoints for data collection, statistics, prediction, and regression.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import numpy as np

from database import get_db
from models import StudentData
from schemas import (
    StudentDataCreate,
    StudentDataResponse,
    PredictionRequest,
    PredictionResponse,
    StatsResponse,
    RegressionResponse,
    SweetSpotResponse,
)
from regression import fit_regression, predict_mgp, compute_correlations, compute_sweet_spot

router = APIRouter(prefix="/api", tags=["MGP-Predict"])


# ── POST /api/students ────────────────────────────────────────

@router.post("/students", response_model=StudentDataResponse, status_code=201)
def create_student(data: StudentDataCreate, db: Session = Depends(get_db)):
    """Collecter les données d'un étudiant."""
    student = StudentData(**data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


# ── GET /api/students ─────────────────────────────────────────

@router.get("/students", response_model=list[StudentDataResponse])
def list_students(
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    """Lister toutes les entrées étudiantes."""
    students = db.query(StudentData).offset(skip).limit(limit).all()
    return students


# ── GET /api/stats ────────────────────────────────────────────

@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    """Statistiques descriptives et corrélations."""
    students = db.query(StudentData).all()
    if not students:
        raise HTTPException(status_code=404, detail="Aucune donnée disponible")

    mgps = [s.mgp for s in students]
    arr = np.array(mgps)

    # Répartition par fourchettes
    repartition = {
        "0.0 - 1.0": 0,
        "1.0 - 1.5": 0,
        "1.5 - 2.0": 0,
        "2.0 - 2.5": 0,
        "2.5 - 3.0": 0,
        "3.0 - 3.5": 0,
        "3.5 - 4.0": 0,
    }
    for m in mgps:
        if m < 1.0:
            repartition["0.0 - 1.0"] += 1
        elif m < 1.5:
            repartition["1.0 - 1.5"] += 1
        elif m < 2.0:
            repartition["1.5 - 2.0"] += 1
        elif m < 2.5:
            repartition["2.0 - 2.5"] += 1
        elif m < 3.0:
            repartition["2.5 - 3.0"] += 1
        elif m < 3.5:
            repartition["3.0 - 3.5"] += 1
        else:
            repartition["3.5 - 4.0"] += 1

    # Corrélations
    correlations = compute_correlations(db)

    # R²
    reg = fit_regression(db)
    r_squared = reg["r_squared"] if reg else 0.0

    return StatsResponse(
        total_etudiants=len(students),
        mgp_moyenne=round(float(np.mean(arr)), 2),
        mgp_mediane=round(float(np.median(arr)), 2),
        mgp_ecart_type=round(float(np.std(arr)), 2),
        correlations=correlations,
        repartition_mgp=repartition,
        r_squared=round(r_squared, 4),
    )


# ── POST /api/predict ─────────────────────────────────────────

@router.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest, db: Session = Depends(get_db)):
    """Prédire la MGP basée sur les variables d'entrée."""
    result = predict_mgp(
        db,
        sommeil=req.temps_sommeil,
        etude=req.temps_etude,
        distraction=req.temps_distraction,
        concentration=req.concentration,
        moment=req.moment_etude,
    )
    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Pas assez de données pour entraîner le modèle (minimum 5 entrées).",
        )
    return PredictionResponse(**result)


# ── GET /api/regression ───────────────────────────────────────

@router.get("/regression", response_model=RegressionResponse)
def get_regression(db: Session = Depends(get_db)):
    """Obtenir les coefficients du modèle de régression."""
    result = fit_regression(db)
    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Pas assez de données pour entraîner le modèle.",
        )
    return RegressionResponse(**result)


# ── GET /api/sweet-spot ───────────────────────────────────────

@router.get("/sweet-spot", response_model=SweetSpotResponse)
def get_sweet_spot(db: Session = Depends(get_db)):
    """Calculer le point d'équilibre optimal."""
    result = compute_sweet_spot(db)
    if result is None:
        raise HTTPException(
            status_code=400,
            detail="Pas assez de données pour calculer le sweet spot.",
        )
    return SweetSpotResponse(**result)


# ── GET /api/scatter-data ─────────────────────────────────────

@router.get("/scatter-data")
def get_scatter_data(db: Session = Depends(get_db)):
    """Get raw scatter data for charts."""
    students = db.query(StudentData).all()
    if not students:
        raise HTTPException(status_code=404, detail="Aucune donnée disponible")

    data = []
    for s in students:
        data.append({
            "temps_sommeil": s.temps_sommeil,
            "temps_etude": s.temps_etude,
            "temps_distraction": s.temps_distraction,
            "moment_etude": s.moment_etude,
            "concentration": s.concentration,
            "mgp": s.mgp,
        })

    # Also compute regression line for study vs MGP
    etudes = [s.temps_etude for s in students]
    mgps = [s.mgp for s in students]

    if len(etudes) > 1:
        coeffs = np.polyfit(etudes, mgps, 1)
        x_line = [min(etudes), max(etudes)]
        y_line = [coeffs[0] * x + coeffs[1] for x in x_line]
    else:
        x_line = []
        y_line = []

    return {
        "points": data,
        "regression_line": {"x": x_line, "y": y_line},
    }

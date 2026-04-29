"""
MGP-Predict — API Routes
"""

import random
import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

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
    student = StudentData(**data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


# ── GET /api/students ─────────────────────────────────────────

@router.get("/students", response_model=list[StudentDataResponse])
def list_students(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(StudentData).offset(skip).limit(limit).all()


# ── GET /api/stats ────────────────────────────────────────────

@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    students = db.query(StudentData).all()

    if not students:
        return StatsResponse(
            total_etudiants=0,
            mgp_moyenne=0.0,
            mgp_mediane=0.0,
            mgp_ecart_type=0.0,
            correlations=[],
            repartition_mgp={
                "0.0 - 1.0": 0, "1.0 - 1.5": 0, "1.5 - 2.0": 0,
                "2.0 - 2.5": 0, "2.5 - 3.0": 0, "3.0 - 3.5": 0, "3.5 - 4.0": 0,
            },
            r_squared=0.0,
        )

    mgps = [s.mgp for s in students]
    arr = np.array(mgps)

    repartition = {
        "0.0 - 1.0": 0, "1.0 - 1.5": 0, "1.5 - 2.0": 0,
        "2.0 - 2.5": 0, "2.5 - 3.0": 0, "3.0 - 3.5": 0, "3.5 - 4.0": 0,
    }
    for m in mgps:
        if m < 1.0:   repartition["0.0 - 1.0"] += 1
        elif m < 1.5: repartition["1.0 - 1.5"] += 1
        elif m < 2.0: repartition["1.5 - 2.0"] += 1
        elif m < 2.5: repartition["2.0 - 2.5"] += 1
        elif m < 3.0: repartition["2.5 - 3.0"] += 1
        elif m < 3.5: repartition["3.0 - 3.5"] += 1
        else:         repartition["3.5 - 4.0"] += 1

    correlations = compute_correlations(db)
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
    result = fit_regression(db)
    if result is None:
        raise HTTPException(status_code=400, detail="Pas assez de données.")
    return RegressionResponse(**result)


# ── GET /api/sweet-spot ───────────────────────────────────────

@router.get("/sweet-spot", response_model=SweetSpotResponse)
def get_sweet_spot(db: Session = Depends(get_db)):
    result = compute_sweet_spot(db)
    if result is None:
        raise HTTPException(status_code=400, detail="Pas assez de données.")
    return SweetSpotResponse(**result)


# ── GET /api/scatter-data ─────────────────────────────────────

@router.get("/scatter-data")
def get_scatter_data(db: Session = Depends(get_db)):
    students = db.query(StudentData).all()

    if not students:
        return {"points": [], "regression_line": {"x": [], "y": []}}

    data = [
        {
            "temps_sommeil": s.temps_sommeil,
            "temps_etude": s.temps_etude,
            "temps_distraction": s.temps_distraction,
            "moment_etude": s.moment_etude,
            "concentration": s.concentration,
            "mgp": s.mgp,
        }
        for s in students
    ]

    etudes = [s.temps_etude for s in students]
    mgps_list = [s.mgp for s in students]

    if len(etudes) > 1:
        coeffs = np.polyfit(etudes, mgps_list, 1)
        x_line = [min(etudes), max(etudes)]
        y_line = [coeffs[0] * x + coeffs[1] for x in x_line]
    else:
        x_line, y_line = [], []

    return {"points": data, "regression_line": {"x": x_line, "y": y_line}}


# ── GET /api/seed ─────────────────────────────────────────────
# Endpoint pour seeder la BD directement depuis le navigateur

def _generate_entries(n: int = 150) -> list[dict]:
    random.seed(42)
    np.random.seed(42)
    profiles = [
        (0.20, (7.0, 9.0), (5.0, 9.0), (0.5, 2.0), (4, 5), 0.6),
        (0.25, (6.5, 8.5), (3.5, 6.0), (1.0, 3.0), (3, 5), 0.5),
        (0.25, (5.5, 8.0), (2.0, 4.5), (2.0, 4.5), (2, 4), 0.4),
        (0.15, (4.0, 6.5), (1.0, 3.0), (3.5, 6.0), (1, 3), 0.3),
        (0.10, (3.0, 5.0), (2.0, 7.0), (1.0, 4.0), (1, 4), 0.5),
        (0.05, (6.0, 8.0), (1.0, 3.0), (5.0, 8.0), (1, 3), 0.3),
    ]
    counts = [int(n * w) for w, *_ in profiles]
    for i in range(n - sum(counts)):
        counts[i % len(counts)] += 1

    entries = []
    for idx, (_, sleep_r, study_r, dist_r, conc_r, matin_p) in enumerate(profiles):
        for _ in range(counts[idx]):
            sommeil     = round(random.uniform(*sleep_r), 1)
            etude       = round(random.uniform(*study_r), 1)
            distraction = round(random.uniform(*dist_r), 1)
            concentration = random.randint(*conc_r)
            moment      = "matin" if random.random() < matin_p else "soir"

            conc_eff   = min(concentration, 2) if sommeil < 5.0 else concentration
            study_score = (etude * conc_eff) / 50.0 * 3.5 + 0.5
            sleep_f    = 1.05 if 7 <= sommeil <= 9 else (0.80 if sommeil < 5 else (0.90 if sommeil < 6 else 1.0))
            dist_pen   = -random.uniform(0.3, 0.8) if distraction > 4 else (-random.uniform(0.1, 0.3) if distraction > 3 else 0.0)
            mgp        = study_score * sleep_f + dist_pen + (0.1 if moment == "matin" else 0.0)
            mgp        = round(max(0.5, min(4.0, mgp + np.random.normal(0, 0.15))), 2)

            entries.append({
                "temps_sommeil": sommeil, "temps_etude": etude,
                "temps_distraction": distraction, "moment_etude": moment,
                "concentration": concentration, "mgp": mgp,
            })
    random.shuffle(entries)
    return entries


@router.get("/seed")
def seed_database(db: Session = Depends(get_db)):
    """Peuple la base de données avec 150 étudiants réalistes."""
    existing = db.query(StudentData).count()
    if existing > 0:
        db.query(StudentData).delete()
        db.commit()

    entries = _generate_entries(150)
    for e in entries:
        db.add(StudentData(**e))
    db.commit()

    mgps = [e["mgp"] for e in entries]
    return {
        "success": True,
        "message": f"✅ {len(entries)} étudiants insérés avec succès !",
        "stats": {
            "total": len(entries),
            "mgp_moyenne": round(float(np.mean(mgps)), 2),
            "mgp_min": min(mgps),
            "mgp_max": max(mgps),
        }
    }

"""
MGP-Predict — Multiple Linear Regression Engine
Implements OLS regression using NumPy for MGP prediction.

Model: MGP = β₀ + β₁·sommeil + β₂·etude + β₃·distraction + β₄·concentration + β₅·moment_soir
"""

import numpy as np
from sqlalchemy.orm import Session

from models import StudentData


def _build_dataset(db: Session):
    """Extract features matrix X and target vector y from database."""
    rows = db.query(StudentData).all()
    if len(rows) < 5:
        return None, None, None

    X = []
    y = []
    for r in rows:
        X.append([
            r.temps_sommeil,
            r.temps_etude,
            r.temps_distraction,
            r.concentration,
            1.0 if r.moment_etude == "soir" else 0.0,
        ])
        y.append(r.mgp)

    return np.array(X), np.array(y), rows


FEATURE_NAMES = [
    "temps_sommeil",
    "temps_etude",
    "temps_distraction",
    "concentration",
    "moment_soir",
]


def fit_regression(db: Session):
    """
    Fit OLS multiple linear regression.
    β = (XᵀX)⁻¹ Xᵀy

    Returns dict with coefficients, intercept, R², standard error, and equation.
    """
    X, y, _ = _build_dataset(db)
    if X is None:
        return None

    n, p = X.shape

    # Add intercept column (column of ones)
    X_aug = np.column_stack([np.ones(n), X])

    # OLS: β = (XᵀX)⁻¹ Xᵀy
    try:
        XtX_inv = np.linalg.inv(X_aug.T @ X_aug)
    except np.linalg.LinAlgError:
        # Use pseudo-inverse if singular
        XtX_inv = np.linalg.pinv(X_aug.T @ X_aug)

    beta = XtX_inv @ X_aug.T @ y

    # Predictions and residuals
    y_pred = X_aug @ beta
    residuals = y - y_pred

    # R²
    ss_res = np.sum(residuals ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    # Standard error
    se = np.sqrt(ss_res / max(n - p - 1, 1))

    # Build equation string
    intercept = beta[0]
    coeffs = {name: float(beta[i + 1]) for i, name in enumerate(FEATURE_NAMES)}

    terms = [f"{intercept:.3f}"]
    for name, coef in coeffs.items():
        sign = "+" if coef >= 0 else "-"
        terms.append(f"{sign} {abs(coef):.3f}·{name}")
    equation = "MGP = " + " ".join(terms)

    return {
        "coefficients": coeffs,
        "intercept": float(intercept),
        "r_squared": float(r_squared),
        "erreur_standard": float(se),
        "equation": equation,
    }


def predict_mgp(db: Session, sommeil: float, etude: float, distraction: float,
                concentration: int, moment: str):
    """
    Predict MGP for given input variables.
    Returns prediction, per-variable contributions, confidence interval, and recommendations.
    """
    reg = fit_regression(db)
    if reg is None:
        return None

    coeffs = reg["coefficients"]
    intercept = reg["intercept"]
    se = reg["erreur_standard"]

    moment_val = 1.0 if moment == "soir" else 0.0
    features = {
        "temps_sommeil": sommeil,
        "temps_etude": etude,
        "temps_distraction": distraction,
        "concentration": float(concentration),
        "moment_soir": moment_val,
    }

    # Prediction
    mgp_pred = intercept
    contributions = {}
    for name, val in features.items():
        contrib = coeffs[name] * val
        contributions[name] = round(contrib, 4)
        mgp_pred += contrib

    # Clamp to valid range
    mgp_pred = max(0.0, min(4.0, mgp_pred))

    # 95% confidence interval (approx ±2·SE)
    ci_lower = max(0.0, mgp_pred - 2 * se)
    ci_upper = min(4.0, mgp_pred + 2 * se)

    # Generate recommendations
    recs = _generate_recommendations(coeffs, features)

    return {
        "mgp_predite": round(mgp_pred, 2),
        "contributions": contributions,
        "intervalle_confiance": [round(ci_lower, 2), round(ci_upper, 2)],
        "recommandations": recs,
    }


def _generate_recommendations(coeffs: dict, features: dict) -> list[str]:
    """Generate actionable recommendations based on regression coefficients."""
    recs = []

    if features["temps_sommeil"] < 6:
        recs.append(
            "⚠️ Votre sommeil est insuffisant. Dormir au moins 7h améliore "
            "significativement la concentration et la MGP."
        )

    if features["temps_etude"] < 3:
        recs.append(
            "📚 Augmenter votre temps d'étude à 4-6h par jour pourrait "
            f"améliorer votre MGP de +{abs(coeffs['temps_etude'] * 2):.2f} points."
        )

    if features["temps_distraction"] > 3:
        recs.append(
            "📱 Réduire les distractions en dessous de 3h libérerait du temps "
            "pour l'étude et améliorerait votre concentration."
        )

    if features["concentration"] < 3:
        recs.append(
            "🧠 Techniques de concentration (Pomodoro, deep work) peuvent "
            "augmenter votre efficacité d'étude."
        )

    if not recs:
        recs.append(
            "✅ Vos habitudes sont bien équilibrées ! Continuez ainsi pour "
            "maintenir une MGP élevée."
        )

    return recs


def compute_correlations(db: Session):
    """Compute Pearson correlation coefficients between each variable and MGP."""
    X, y, _ = _build_dataset(db)
    if X is None:
        return []

    var_labels = [
        ("temps_sommeil", "Temps de Sommeil"),
        ("temps_etude", "Temps d'Étude"),
        ("temps_distraction", "Temps de Distraction"),
        ("concentration", "Concentration"),
        ("moment_soir", "Étude le Soir"),
    ]

    correlations = []
    for i, (var_key, var_label) in enumerate(var_labels):
        r = float(np.corrcoef(X[:, i], y)[0, 1])

        if abs(r) > 0.7:
            strength = "Forte"
        elif abs(r) > 0.4:
            strength = "Modérée"
        else:
            strength = "Faible"

        direction = "positive" if r > 0 else "négative"
        interp = f"Corrélation {strength.lower()} {direction} (r = {r:.3f})"

        correlations.append({
            "variable": var_label,
            "coefficient": round(r, 4),
            "interpretation": interp,
        })

    return correlations


def compute_sweet_spot(db: Session):
    """
    Compute the optimal balance point between sleep and study time.
    Uses the regression model to find the combination maximizing predicted MGP.
    """
    reg = fit_regression(db)
    if reg is None:
        return None

    coeffs = reg["coefficients"]
    intercept = reg["intercept"]

    best_mgp = -1
    best_params = {}

    # Grid search over reasonable ranges
    for sommeil in np.arange(5.0, 10.0, 0.5):
        for etude in np.arange(1.0, 10.0, 0.5):
            # Constraint: sommeil + etude + distraction ≤ 20h (realistic daily budget)
            remaining = max(0, 20 - sommeil - etude)
            distraction = min(remaining, 2.0)  # Minimize distraction for optimal

            for conc in range(3, 6):
                # If sleep < 5, concentration capped at 2 (matching seed logic)
                effective_conc = min(conc, 2) if sommeil < 5 else conc

                mgp = (
                    intercept
                    + coeffs["temps_sommeil"] * sommeil
                    + coeffs["temps_etude"] * etude
                    + coeffs["temps_distraction"] * distraction
                    + coeffs["concentration"] * effective_conc
                    + coeffs["moment_soir"] * 0  # matin is optimal
                )
                mgp = max(0, min(4, mgp))

                if mgp > best_mgp:
                    best_mgp = mgp
                    best_params = {
                        "sommeil": sommeil,
                        "etude": etude,
                        "distraction": distraction,
                        "concentration": conc,
                    }

    return {
        "sommeil_optimal": best_params.get("sommeil", 7.5),
        "etude_optimale": best_params.get("etude", 5.0),
        "distraction_max": best_params.get("distraction", 2.0),
        "concentration_ideale": best_params.get("concentration", 4),
        "mgp_estimee": round(best_mgp, 2),
        "message": (
            f"Le point d'équilibre optimal est de {best_params.get('sommeil', 7.5):.1f}h de sommeil, "
            f"{best_params.get('etude', 5.0):.1f}h d'étude, avec une concentration de "
            f"{best_params.get('concentration', 4)}/5 et moins de "
            f"{best_params.get('distraction', 2.0):.1f}h de distraction."
        ),
    }

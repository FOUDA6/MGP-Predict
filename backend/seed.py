"""
MGP-Predict — Seed Script
Generates 150 realistic student entries with enforced statistical constraints.

Logic:
  - MGP ∝ (temps_etude × concentration)
  - temps_sommeil < 5h → concentration_effective = min(concentration, 2)
  - temps_distraction > 4h → MGP penalty of -0.3 to -0.8
  - moment_etude == "matin" → slight bonus (+0.1)
  - Gaussian noise N(0, 0.15) for human variance
  - Final MGP clamped to [0.5, 4.0]
"""

import random
import numpy as np
from database import engine, SessionLocal, Base
from models import StudentData


def generate_entries(n: int = 150) -> list[dict]:
    """Generate n realistic student data entries."""
    random.seed(42)
    np.random.seed(42)

    entries = []

    # Define student profiles for diversity
    profiles = [
        # (weight, sleep_range, study_range, distraction_range, concentration_range, moment_bias)
        # Excellent students
        (0.20, (7.0, 9.0), (5.0, 9.0), (0.5, 2.0), (4, 5), 0.6),
        # Good students
        (0.25, (6.5, 8.5), (3.5, 6.0), (1.0, 3.0), (3, 5), 0.5),
        # Average students
        (0.25, (5.5, 8.0), (2.0, 4.5), (2.0, 4.5), (2, 4), 0.4),
        # Struggling students
        (0.15, (4.0, 6.5), (1.0, 3.0), (3.5, 6.0), (1, 3), 0.3),
        # Sleep-deprived students
        (0.10, (3.0, 5.0), (2.0, 7.0), (1.0, 4.0), (1, 4), 0.5),
        # Distracted students
        (0.05, (6.0, 8.0), (1.0, 3.0), (5.0, 8.0), (1, 3), 0.3),
    ]

    # Calculate number of students per profile
    counts = []
    for weight, *_ in profiles:
        counts.append(int(n * weight))
    # Distribute remainder
    remainder = n - sum(counts)
    for i in range(remainder):
        counts[i % len(counts)] += 1

    for profile_idx, (_, sleep_range, study_range, distract_range, conc_range, matin_prob) in enumerate(profiles):
        for _ in range(counts[profile_idx]):
            # Generate raw variables
            sommeil = round(random.uniform(*sleep_range), 1)
            etude = round(random.uniform(*study_range), 1)
            distraction = round(random.uniform(*distract_range), 1)
            concentration = random.randint(*conc_range)
            moment = "matin" if random.random() < matin_prob else "soir"

            # ── STATISTICAL LOGIC ─────────────────────────────────

            # Rule 1: Sleep deprivation caps concentration
            if sommeil < 5.0:
                concentration_effective = min(concentration, 2)
            else:
                concentration_effective = concentration

            # Rule 2: Base MGP from study × concentration interaction
            # Normalized: etude (0-10) × concentration (1-5) → (0-50) mapped to (0.5-4.0)
            study_score = (etude * concentration_effective) / 50.0 * 3.5 + 0.5

            # Rule 3: Sleep bonus (optimal around 7-8h)
            sleep_factor = 1.0
            if sommeil >= 7.0 and sommeil <= 9.0:
                sleep_factor = 1.05  # Slight boost for optimal sleep
            elif sommeil < 5.0:
                sleep_factor = 0.80  # Penalty for sleep deprivation
            elif sommeil < 6.0:
                sleep_factor = 0.90

            # Rule 4: Distraction penalty
            distraction_penalty = 0.0
            if distraction > 4.0:
                distraction_penalty = -random.uniform(0.3, 0.8)
            elif distraction > 3.0:
                distraction_penalty = -random.uniform(0.1, 0.3)

            # Rule 5: Morning study bonus
            morning_bonus = 0.1 if moment == "matin" else 0.0

            # Compute MGP
            mgp = study_score * sleep_factor + distraction_penalty + morning_bonus

            # Rule 6: Gaussian noise for human variance
            noise = np.random.normal(0, 0.15)
            mgp += noise

            # Rule 7: Clamp to valid range
            mgp = round(max(0.5, min(4.0, mgp)), 2)

            entries.append({
                "temps_sommeil": sommeil,
                "temps_etude": etude,
                "temps_distraction": distraction,
                "moment_etude": moment,
                "concentration": concentration,
                "mgp": mgp,
            })

    random.shuffle(entries)
    return entries


def run_seed():
    """Insert seed data into the database."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if data already exists
        existing = db.query(StudentData).count()
        if existing > 0:
            print(f"⚠️  Base de données contient déjà {existing} entrées. Nettoyage...")
            db.query(StudentData).delete()
            db.commit()

        # Generate and insert entries
        entries = generate_entries(150)
        for entry in entries:
            db.add(StudentData(**entry))

        db.commit()
        print(f"✅ {len(entries)} entrées insérées avec succès !")

        # Print quick stats
        mgps = [e["mgp"] for e in entries]
        print(f"   MGP moyenne : {np.mean(mgps):.2f}")
        print(f"   MGP médiane : {np.median(mgps):.2f}")
        print(f"   MGP min/max : {min(mgps):.2f} / {max(mgps):.2f}")
        print(f"   Écart-type  : {np.std(mgps):.2f}")

    finally:
        db.close()


if __name__ == "__main__":
    run_seed()

"""
MGP-Predict — SQLAlchemy Models
Table: student_data
"""

from datetime import datetime, timezone

from sqlalchemy import Column, Integer, Float, String, DateTime, CheckConstraint

from database import Base


class StudentData(Base):
    __tablename__ = "student_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Lifestyle variables
    temps_sommeil = Column(Float, nullable=False, comment="Heures de sommeil (0-14)")
    temps_etude = Column(Float, nullable=False, comment="Heures d'étude (0-16)")
    temps_distraction = Column(Float, nullable=False, comment="Heures de distraction (0-12)")
    moment_etude = Column(String(10), nullable=False, comment="matin ou soir")
    concentration = Column(Integer, nullable=False, comment="Intensité 1-5")

    # Target variable
    mgp = Column(Float, nullable=False, comment="Moyenne Générale Pondérée (0-4)")

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint("temps_sommeil >= 0 AND temps_sommeil <= 14", name="ck_sommeil"),
        CheckConstraint("temps_etude >= 0 AND temps_etude <= 16", name="ck_etude"),
        CheckConstraint("temps_distraction >= 0 AND temps_distraction <= 12", name="ck_distraction"),
        CheckConstraint("moment_etude IN ('matin', 'soir')", name="ck_moment"),
        CheckConstraint("concentration >= 1 AND concentration <= 5", name="ck_concentration"),
        CheckConstraint("mgp >= 0 AND mgp <= 4", name="ck_mgp"),
    )

    def __repr__(self):
        return f"<StudentData(id={self.id}, mgp={self.mgp})>"

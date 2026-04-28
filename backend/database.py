"""
MGP-Predict — Database Configuration
SQLAlchemy engine, session, and base model.
Supports PostgreSQL (Supabase) via DATABASE_URL env variable.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Supabase/PostgreSQL in production, SQLite locally
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./mgp_predict.db")

# Fix for Supabase/Heroku-style postgres:// URLs (SQLAlchemy requires postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Engine configuration
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False,
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency: yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

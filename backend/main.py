"""
MGP-Predict — FastAPI Application
Main entry point for the backend server.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="MGP-Predict API",
    description="API de prédiction de la Moyenne Générale Pondérée (MGP) — INF 232",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend URL from env var (Vercel) + localhost for dev
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "MGP-Predict API v1.0",
        "docs": "/docs",
        "project": "INF 232 — Analyse de Données",
    }

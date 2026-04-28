#!/bin/bash
# MGP-Predict — Startup Script
# Usage: bash start.sh

echo "🚀 MGP-Predict — Démarrage"
echo "=========================="

# ── Backend ──────────────────────────────────────
echo ""
echo "📦 Installation des dépendances backend..."
cd backend
./venv/bin/pip install fastapi 'uvicorn[standard]' sqlalchemy numpy pydantic -q

echo "🌱 Seeding de la base de données..."
./venv/bin/python seed.py

echo "🖥️  Démarrage du serveur FastAPI (port 8000)..."
./venv/bin/python -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

cd ..

# ── Frontend ─────────────────────────────────────
echo ""
echo "📦 Installation des dépendances frontend..."
cd frontend
npm install

echo "🌐 Démarrage du serveur Next.js (port 3000)..."
npm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

cd ..

echo ""
echo "✅ MGP-Predict est prêt !"
echo "   🖥️  Backend  : http://localhost:8000"
echo "   🌐 Frontend : http://localhost:3000"
echo "   📖 API Docs : http://localhost:8000/docs"
echo ""
echo "   Pour arrêter : kill $BACKEND_PID $FRONTEND_PID"

# Wait for both processes
wait

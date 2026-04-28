# MGP-Predict 🎓

> Plateforme de prédiction de la Moyenne Générale Pondérée (MGP)  
> **Projet INF 232 — Analyse de Données**

## 🚀 Démarrage Rapide

### 1. Backend (FastAPI)

```bash
cd backend

# Créer un venv si nécessaire
python3 -m venv venv

# Installer les dépendances
./venv/bin/pip install fastapi 'uvicorn[standard]' sqlalchemy numpy pydantic

# Seeder la base de données (150 entrées)
./venv/bin/python seed.py

# Démarrer le serveur
./venv/bin/python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)

```bash
cd frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### 3. Accéder à l'application

- 🌐 **Frontend** : http://localhost:3000
- 🖥️ **Backend API** : http://localhost:8000
- 📖 **API Docs** : http://localhost:8000/docs

## 📁 Structure du Projet

```
MGP-Predict/
├── backend/
│   ├── main.py           # Application FastAPI
│   ├── database.py       # Configuration SQLAlchemy
│   ├── models.py         # Modèle StudentData
│   ├── schemas.py        # Schemas Pydantic
│   ├── routes.py         # Endpoints API
│   ├── regression.py     # Moteur de Régression Linéaire Multiple
│   ├── seed.py           # Génération de 150 données réalistes
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Layout avec Navbar
│   │   │   ├── page.tsx          # Dashboard d'Analyse
│   │   │   ├── collect/page.tsx  # Formulaire de Collecte
│   │   │   ├── predict/page.tsx  # Moteur de Prédiction
│   │   │   └── globals.css       # Design System (Dark Mode)
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ChartScatter.tsx
│   │   │   ├── ChartBar.tsx
│   │   │   ├── ChartBubble.tsx
│   │   │   └── GaugeChart.tsx
│   │   └── lib/
│   │       ├── api.ts            # Client API TypeScript
│   │       └── chartSetup.ts     # Chart.js registration
│   ├── tailwind.config.ts
│   └── package.json
│
├── start.sh              # Script de démarrage complet
└── README.md
```

## 📊 API Endpoints

| Méthode | Route             | Description                              |
|---------|-------------------|------------------------------------------|
| POST    | `/api/students`   | Créer une entrée étudiant                |
| GET     | `/api/students`   | Lister toutes les entrées                |
| GET     | `/api/stats`      | Statistiques descriptives + corrélations |
| POST    | `/api/predict`    | Prédiction MGP via régression            |
| GET     | `/api/regression` | Coefficients du modèle + R²             |
| GET     | `/api/sweet-spot` | Point d'équilibre optimal                |
| GET     | `/api/scatter-data` | Données pour les graphiques            |

## 🧠 Logique Statistique du Seed

- **MGP ∝ (temps_étude × concentration)** — corrélation positive forte
- **Sommeil < 5h** → concentration effective plafonnée à 2
- **Distraction > 4h** → pénalité MGP de -0.3 à -0.8
- **Étude le matin** → bonus de +0.1
- **Bruit gaussien** N(0, 0.15) pour variance humaine
- **MGP clampée** dans [0.5, 4.0]

## 🔬 Régression Linéaire Multiple

```
MGP = β₀ + β₁·sommeil + β₂·étude + β₃·distraction + β₄·concentration + β₅·moment_soir
```

Méthode : **Moindres Carrés Ordinaires (OLS)**  
`β = (XᵀX)⁻¹ Xᵀy`

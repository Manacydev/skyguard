# SkyGuard

Aviation Safety Intelligence Platform — ML-powered risk assessment for airline flights with historical incident analysis and safety scoring.

## Features

✈️ **Flight Safety Check** — Analyze any flight's historical safety record, risk profile, and incident history  
📊 **ML-Powered Risk Model** — Machine learning classification for safe/moderate/high-risk categorization  
🔍 **Flight Search** — Discover and compare flights ranked by safety score and price  
📈 **Incident Timeline** — Visualize airline incident history with severity levels  
💡 **Safer Alternatives** — Get recommendations for safer flights on similar routes  
🎨 **Dark UI Dashboard** — Modern, responsive Tailwind CSS interface with live data viz  

## Tech Stack

### Frontend
- **React 18** — UI framework
- **Vite** — Lightning-fast build tool & dev server
- **Tailwind CSS** — Utility-first styling
- **JavaScript** — Flight data processing & visualization

### Backend
- **FastAPI** — High-performance Python web framework
- **Uvicorn** — ASGI server
- **Pandas** — Data processing
- **Scikit-learn** — ML model serialization

### Data & ML
- **Python ML Pipeline** — Feature engineering, model training
- **Joblib** — Model persistence
- **CSV Datasets** — Aviation safety records, airline incidents

## Prerequisites

- **Node.js** 16+ (with npm)
- **Python** 3.8+ (with pip or conda)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/skyguard.git
cd skyguard
```

### 2. Set Up Backend

```bash
# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn pandas scikit-learn python-multipart
```

### 3. Set Up Frontend

```bash
# Install Node dependencies
npm install
```

## Running the Application

### Start Backend (FastAPI Server on port 8000)

```bash
npm run backend
```

Or manually:
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Start Frontend (Vite Dev Server on port 5173)

Open a **new terminal** and run:
```bash
npm run dev
```

### Access the App

Open your browser to: **http://localhost:5173**

## Project Structure

```
skyguard/
├── backend/
│   └── main.py              # FastAPI application & endpoints
├── src/
│   ├── main.jsx             # React app entry point
│   ├── App.jsx              # Root component
│   ├── index.css            # Tailwind styles
├── dashboard.jsx             # Main dashboard component
├── data/
│   ├── raw/                 # Original datasets
│   └── processed/           # Cleaned data & safety scores
├── model/
│   ├── safety_model.pkl     # Trained ML model
│   └── feature_names.pkl    # Feature mapping
├── package.json              # npm dependencies & scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── index.html               # HTML entry point
└── README.md                # This file
```

## API Endpoints

### POST /safety-check
Analyze a flight's safety profile.

**Request:**
```json
{
  "airline": "Air India",
  "flight_number": "AI-302",
  "departure": "DEL",
  "arrival": "BOM"
}
```

**Response:**
```json
{
  "airline": "Air India",
  "flight": "AI-302",
  "safety_score": 7.8,
  "risk_label": "Moderate Risk",
  "incidents": 23,
  "fatalities": 12,
  "confidence": {
    "Safe": 0.15,
    "Moderate Risk": 0.65,
    "High Risk": 0.2
  }
}
```

### GET /airlines
List all airlines in the database.

### GET /health
Health check endpoint.

## Test Data

Try these airlines and flights:

| Airline | Flight | Route | Safety |
|---------|--------|-------|--------|
| Singapore Airlines | SQ-404 | DEL → SIN | ✅ Safe (9.7) |
| Emirates | EK-205 | DEL → DXB | ✅ Safe (9.5) |
| Air India | AI-302 | DEL → BOM | ⚠️ Moderate (7.8) |
| SpiceJet | SG-152 | DEL → BOM | 🔴 High Risk (6.9) |

## Available npm Scripts

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run backend      # Start FastAPI backend
npm start            # Alias for npm run dev
```

## Data Sources

- **airline_safety_scores.csv** — Processed safety metrics per airline
- **aviation_clean.csv** — Cleaned aviation incident data
- **safety_db.json** — Structured incident reference database
- **NTSB/FAA datasets** — National Transportation Safety Board & Federal Aviation Administration records

## Model Details

The ML safety model predicts risk categories (Safe/Moderate Risk/High Risk) based on:
- Historical incident frequency
- Fatality rates
- Time since last incident (recency factor)
- Average incident severity

Features are normalized and weighted for robust predictions.

## Development

### Adding New Features

1. **Backend:** Modify `backend/main.py` and add new endpoints
2. **Frontend:** Update `dashboard.jsx` or split into components in `src/`
3. **Styles:** Extend `tailwind.config.js` or add CSS in `src/index.css`

### Running in Production

```bash
# Build frontend
npm run build

# Serve backend with production settings
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

## License

MIT License — See LICENSE file for details

## Contact

For questions or issues, open a GitHub issue or contact the development team.

---

**Last Updated:** April 16, 2026  
**Status:** Active Development  
**Version:** 1.0.0

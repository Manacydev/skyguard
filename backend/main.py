# backend/main.py
# Run: uvicorn main:app --reload

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd, joblib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "model"
DATA_DIR = ROOT / "data" / "processed"

app = FastAPI(title="SkyGuard Safety API", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"], allow_headers=["*"],
    allow_credentials=True,
)

model    = joblib.load(MODEL_DIR / "safety_model.pkl")
features = joblib.load(MODEL_DIR / "feature_names.pkl")
scores   = pd.read_csv(DATA_DIR / "airline_safety_scores.csv")
with open(DATA_DIR / "safety_db.json") as f:
    safety_db = json.load(f)

class SafetyRequest(BaseModel):
    airline: str
    flight_number: str
    departure: str = ""
    arrival: str = ""

@app.post("/safety-check")
def safety_check(req: SafetyRequest):
    row = scores[scores["airline"].str.lower().str.contains(
        req.airline.lower(), na=False)]
    if row.empty:
        raise HTTPException(status_code=404, detail="Airline not found")
    row = row.iloc[0]
    X = pd.DataFrame([row[features].fillna(0)])
    risk  = model.predict(X)[0]
    proba = model.predict_proba(X)[0].tolist()
    return {
        "airline":      row["airline"],
        "flight":       req.flight_number,
        "safety_score": round(float(row["safety_score"]), 2),
        "risk_label":   risk,
        "incidents":    int(row["total_incidents"]),
        "fatalities":   int(row["total_fatalities"]),
        "confidence":   dict(zip(model.classes_, proba)),
    }

@app.get("/airlines")
def list_airlines():
    return scores[["airline","safety_score","risk_label",
                   "total_incidents","total_fatalities"]].to_dict(orient="records")

@app.get("/health")
def health(): return {"status": "ok"}
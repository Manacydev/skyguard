import json
import pandas as pd
import joblib
from pathlib import Path

# Load data and model
ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "model"
DATA_DIR = ROOT / "data" / "processed"

try:
    model = joblib.load(MODEL_DIR / "safety_model.pkl")
    features = joblib.load(MODEL_DIR / "feature_names.pkl")
    scores = pd.read_csv(DATA_DIR / "airline_safety_scores.csv")
except Exception as e:
    model = None
    features = None
    scores = None
    load_error = str(e)

def handler(request):
    # Handle both method access styles
    method = getattr(request, 'method', request.get('method', 'POST'))
    body = getattr(request, 'body', request.get('body', ''))
    
    if isinstance(body, bytes):
        body = body.decode('utf-8')
    
    if method != 'POST':
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        if not model or not features or not scores:
            return {
                "statusCode": 503,
                "body": json.dumps({"error": "Model not loaded"})
            }
        
        data = json.loads(body) if isinstance(body, str) else body
        airline = data.get('airline', '').strip()
        flight_number = data.get('flight_number', '')

        if not airline:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Airline is required"})
            }

        row = scores[scores["airline"].str.lower().str.contains(
            airline.lower(), na=False)]
        if row.empty:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Airline not found"})
            }

        row = row.iloc[0]
        X = pd.DataFrame([row[features].fillna(0)])
        risk = model.predict(X)[0]
        proba = model.predict_proba(X)[0].tolist()

        response = {
            "airline": row["airline"],
            "flight": flight_number,
            "safety_score": round(float(row["safety_score"]), 2),
            "risk_label": risk,
            "incidents": int(row["total_incidents"]),
            "fatalities": int(row["total_fatalities"]),
            "confidence": dict(zip(model.classes_, proba)),
        }

        return {
            "statusCode": 200,
            "body": json.dumps(response)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
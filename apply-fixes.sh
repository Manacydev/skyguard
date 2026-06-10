#!/bin/bash
set -e

# vercel.json
cat > vercel.json << 'EOF'
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/safety-check", "destination": "/api/safety-check.py" },
    { "source": "/api/airlines", "destination": "/api/airlines.py" },
    { "source": "/api/health", "destination": "/api/health.py" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
EOF

# requirements.txt
cat > requirements.txt << 'EOF'
numpy
pandas
joblib
scikit-learn
EOF

# src/main.jsx
cat > src/main.jsx << 'EOF'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# api/health.py
cat > api/health.py << 'EOF'
from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
EOF

# api/airlines.py
cat > api/airlines.py << 'EOF'
from http.server import BaseHTTPRequestHandler
import json
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "processed"

try:
    scores = pd.read_csv(DATA_DIR / "airline_safety_scores.csv")
    _load_error = None
except Exception as e:
    scores = None
    _load_error = str(e)

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if scores is None:
            self._respond(503, {"error": f"Data not loaded: {_load_error}"})
            return
        try:
            result = scores[["airline", "safety_score", "risk_label",
                              "total_incidents", "total_fatalities"]].to_dict(orient="records")
            self._respond(200, result)
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self._cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
EOF

# api/safety-check.py
cat > api/safety-check.py << 'EOF'
from http.server import BaseHTTPRequestHandler
import json
import pandas as pd
import joblib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODEL_DIR = ROOT / "model"
DATA_DIR = ROOT / "data" / "processed"

try:
    model = joblib.load(MODEL_DIR / "safety_model.pkl")
    features = joblib.load(MODEL_DIR / "feature_names.pkl")
    scores = pd.read_csv(DATA_DIR / "airline_safety_scores.csv")
    _load_error = None
except Exception as e:
    model = None
    features = None
    scores = None
    _load_error = str(e)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if model is None or scores is None:
            self._respond(503, {"error": f"Model not loaded: {_load_error}"})
            return
        try:
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            data = json.loads(body)
            airline = data.get('airline', '').strip()
            flight_number = data.get('flight_number', '')

            if not airline:
                self._respond(400, {"error": "Airline is required"})
                return

            row = scores[scores["airline"].str.lower().str.contains(
                airline.lower(), na=False)]
            if row.empty:
                self._respond(404, {"error": "Airline not found"})
                return

            row = row.iloc[0]
            X = pd.DataFrame([row[features].fillna(0)])
            risk = model.predict(X)[0]
            proba = model.predict_proba(X)[0].tolist()

            result = {
                "airline": row["airline"],
                "flight": flight_number,
                "safety_score": round(float(row["safety_score"]), 2),
                "risk_label": risk,
                "incidents": int(row["total_incidents"]),
                "fatalities": int(row["total_fatalities"]),
                "confidence": dict(zip(model.classes_, proba)),
            }
            self._respond(200, result)
        except Exception as e:
            self._respond(500, {"error": str(e)})

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def _respond(self, status, body):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self._cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
EOF

git add -A
git commit -m "Fix Vercel deployment: rewrites, Python handler pattern, DataFrame bug, numpy dep"
git push

echo "All done!"

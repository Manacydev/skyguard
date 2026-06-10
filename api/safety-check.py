import csv
import json
from http.server import BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCORES_PATH = ROOT / "data" / "processed" / "airline_safety_scores.csv"


def load_scores():
    with SCORES_PATH.open(newline="", encoding="utf-8") as csv_file:
        return list(csv.DictReader(csv_file))


def find_airline(rows, query):
    query = query.lower()
    for row in rows:
        if query in row["airline"].lower():
            return row
    return None


def confidence_from_score(score, risk_label):
    if risk_label == "Safe":
        safe = min(0.95, 0.55 + max(score - 7.0, 0) / 6)
        return {"Safe": safe, "Moderate Risk": 1 - safe, "High Risk": 0.0}
    if risk_label == "Moderate Risk":
        return {"Safe": 0.2, "Moderate Risk": 0.65, "High Risk": 0.15}
    high = min(0.9, 0.55 + max(7.0 - score, 0) / 6)
    return {"Safe": 0.05, "Moderate Risk": 1 - high - 0.05, "High Risk": high}


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        try:
            body_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(body_length).decode("utf-8") if body_length else "{}"
            data = json.loads(body)
            airline = data.get("airline", "").strip()
            flight_number = data.get("flight_number", "")

            if not airline:
                self._send_json(400, {"error": "Airline is required"})
                return

            row = find_airline(load_scores(), airline)
            if row is None:
                self._send_json(404, {"error": "Airline not found"})
                return

            score = round(float(row["safety_score"]), 2)
            risk_label = row["risk_label"]
            self._send_json(200, {
                "airline": row["airline"],
                "flight": flight_number,
                "safety_score": score,
                "risk_label": risk_label,
                "incidents": int(float(row["total_incidents"])),
                "fatalities": int(float(row["total_fatalities"])),
                "confidence": confidence_from_score(score, risk_label),
            })
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON body"})
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})

    def do_GET(self):
        self._send_json(405, {"error": "Method not allowed"})

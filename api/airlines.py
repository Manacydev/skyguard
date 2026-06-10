import csv
import json
from http.server import BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCORES_PATH = ROOT / "data" / "processed" / "airline_safety_scores.csv"


def load_airlines():
    with SCORES_PATH.open(newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        return [
            {
                "airline": row["airline"],
                "safety_score": float(row["safety_score"]),
                "risk_label": row["risk_label"],
                "total_incidents": int(float(row["total_incidents"])),
                "total_fatalities": int(float(row["total_fatalities"])),
            }
            for row in reader
        ]


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        try:
            self._send_json(200, load_airlines())
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})

    def do_POST(self):
        self._send_json(405, {"error": "Method not allowed"})
